import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { createItemsBulk } from '../../../service/api';
import Swal from 'sweetalert2';
import './ItemMassImport.css';
import { FaFileExcel, FaUpload, FaDownload } from 'react-icons/fa';

const alerta = (titulo, mensaje, tipo = "success") => {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: tipo,
        timer: 2500,
        showConfirmButton: false,
    });
};

const ItemMassImport = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [previewData, setPreviewData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setFileName(selectedFile.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // Validar estructura básica del archivo
            if (jsonData.length > 0 && 
                jsonData[0].hasOwnProperty('Descripción') && 
                jsonData[0].hasOwnProperty('Precio Unitario')) {
                setPreviewData(jsonData.slice(0, 5)); // Mostrar solo 5 registros de ejemplo
            } else {
                alerta("Formato incorrecto", "El archivo no tiene el formato esperado", "error");
                setFile(null);
                setFileName('');
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Transformar datos al formato esperado por el backend
                const itemsToImport = jsonData.map(item => ({
                    descripcion: item['Descripción'] || '',
                    precioUnitario: Number(item['Precio Unitario']) || 0,
                    unidadMedida: item['Unidad de Medida'] || '',
                    codigoProductoSin: Number(item['Código Producto SIN']) || 234109,
                    codigo: item['Código'] || '',
                    cantidad: 0
                }));

                const response = await createItemsBulk(itemsToImport);
                alerta("Importación exitosa", `Se importaron ${response.data.length} productos correctamente`);
                resetForm();
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error al importar productos:", error);
            alerta("Error", "Ocurrió un error al importar los productos", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setFileName('');
        setPreviewData([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const downloadTemplate = () => {
        // Crear datos de ejemplo para el template
        const templateData = [
            {
                'Código': 'PROD001',
                'Descripción': 'Producto de ejemplo',
                'Precio Unitario': 25.99,
                'Unidad de Medida': 'Unidad',
                'Código Producto SIN': 234109
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Productos");
        XLSX.writeFile(wb, "Plantilla_Importacion_Productos.xlsx");
    };

    return (
        <div className="mass-import-container">
            <h2>Importación Masiva de Productos</h2>
            
            <div className="import-instructions">
                <h3>Instrucciones:</h3>
                <ol>
                    <li>Descarga la plantilla de ejemplo</li>
                    <li>Completa los datos de tus productos</li>
                    <li>Sube el archivo Excel</li>
                    <li>Revisa la vista previa</li>
                    <li>Confirma la importación</li>
                </ol>
                
                <button 
                    onClick={downloadTemplate}
                    className="download-template-btn"
                >
                    <FaDownload /> Descargar Plantilla
                </button>
            </div>

            <div className="file-upload-section">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="file-select-btn"
                >
                    <FaFileExcel /> Seleccionar Archivo Excel
                </button>
                
                {fileName && (
                    <div className="file-info">
                        <span>Archivo seleccionado: {fileName}</span>
                    </div>
                )}
            </div>

            {previewData.length > 0 && (
                <div className="preview-section">
                    <h3>Vista Previa (primeros 5 registros)</h3>
                    <div className="preview-table-container">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    {Object.keys(previewData[0]).map(key => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>{value}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {file && (
                <div className="action-buttons">
                    <button
                        onClick={handleUpload}
                        disabled={isLoading}
                        className="upload-btn"
                    >
                        {isLoading ? 'Procesando...' : (<><FaUpload /> Importar Productos</>)}
                    </button>
                    
                    <button
                        onClick={resetForm}
                        className="cancel-btn"
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemMassImport;