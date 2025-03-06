import { React, useRef, useEffect, useState } from "react";
import InputText from "../../components/inputs/InputText";
import { Formik, Form } from "formik";
import loadImage from '../../assets/ImagesApp';
import { FaFile } from "react-icons/fa";
import * as Yup from "yup";
import './Sucursales.css';
import '../../components/forms/itemForm/ItemForm.css';
import { toast } from 'sonner';
import uploadImageToCloudinary from "../../utils/uploadImageToCloudinary ";
import { createSucursal, editSucursal } from "../../service/api";
import { useNavigate } from "react-router-dom";


const AddSucursal = () => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadDefaultImage = async () => {
            const defaultImage = await loadImage('defImg');
            setPreviewUrl(defaultImage.default);
        };
        loadDefaultImage();
    }, []);

    const handleFileChange = (event, setFile, setPreview) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            setFile(file);
        }
    };

    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required("Debe ingresar un nombre"),
        departamento: Yup.string().required("Debe indicar el departamento"),
        municipio: Yup.string().required("Especifique el municipio"),
        direccion: Yup.string().required("Ingrese la dirección"),
        telefono: Yup.number()
            .typeError("Debe ser un número")
            .required("Ingrese el número de contacto"),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        
        try {
            let imageUrl = previewUrl;
            if (selectedFile) {
                imageUrl = await uploadImageToCloudinary(selectedFile);
            }

            const sucursalData = {
                codigo: 0, //static meanwhile
                nombre: values.nombre,
                departamento: values.departamento,
                municipio: values.municipio,
                direccion: values.direccion,
                telefono: values.telefono,
                empresa: values.empresa,
                image: imageUrl,
            }
            await createSucursal(sucursalData);

            resetForm();
            setPreviewUrl(null);
            setSelectedFile(null);
            alert("Sucursal creada exitosamente");
            navigate("/sucursales")
        } catch (error) {
            console.error("Error al crear sucursal:", error);
            toast.error("Error al crear la sucursal");
        }
        setSubmitting(false);
    };

    return (
        <div style={{marginTop:"15px"}}>
            <h1>Datos de la sucursal</h1>
            <Formik 
                initialValues={{
                    nombre: "",
                    departamento: "",
                    municipio: "",
                    direccion: "",
                    telefono: "",
                    empresa: { id: 1, nit: 3655579015, razonSocial: "COA CARDONA DE CARDOZO ANTONIA" },
                    image: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className='cont-new-pat cont-add-sucursal'>
                        <div className="img-card">
                            <img
                                src={previewUrl}
                                alt="Sucursal"
                                style={{ height: '80%', width: '80%', objectFit: 'cover', borderRadius: '30px' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(event) => handleFileChange(event, setSelectedFile, setPreviewUrl)}
                            />
                            <button className="btn-edit" style={{ width: "70%" }} type="button" onClick={() => fileInputRef.current.click()}>
                                <FaFile /> &emsp; Subir Imagen
                            </button>
                        </div>
                        <div className='input-side'>
                            <InputText label="Nombre de la sucursal:" name="nombre" type="text" />
                        <InputText label="Departamento donde se ubica:" name="departamento" type="text" />
                        <InputText label="Municipio:" name="municipio" type="text" />
                        <InputText label="Dirección de la sucursal:" name="direccion" type="text" />
                        <InputText label="Teléfono de la sucursal:" name="telefono" type="integer" />
                         <div>
                            <button type="submit" className="btn-general" disabled={isSubmitting}
                                    onClick={() => navigate("/sucursales")}
                            >
                                {isSubmitting ? "Añadiendo..." : "Añadir Sucursal"}
                            </button>
                        </div>
                        </div>
                        
                       
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddSucursal;