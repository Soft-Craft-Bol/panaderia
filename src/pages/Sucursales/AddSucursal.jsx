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
import { createSucursal, editSucursal, getSucursalID} from "../../service/api";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const alerta = (titulo, mensaje, tipo = "success") => {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: tipo,
        timer: 2500,
        showConfirmButton: false,
    });
};

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

    const { id } = useParams();
    const [initialValues, setInitialValues] = useState({
        nombre: "",
        departamento: "",
        municipio: "",
        direccion: "",
        telefono: "",
        latitud: 0,
        longitud: 0,
        empresa: { id: 1, nit: 3655579015, razonSocial: "COA CARDONA DE CARDOZO ANTONIA" },
        image: "",
    });
    useEffect(()=>{
        if(id){
            const fetchSucursal = async () =>{
                try{
                    const response = await getSucursalID(id);
                    console.log(response);
                    setInitialValues({
                        nombre: response.data.nombre || "",
                        departamento: response.data.departamento || "",
                        municipio: response.data.municipio || "",
                        direccion: response.data.direccion || "",
                        telefono: response.data.telefono || "",
                        image: response.data.image || "",
                        empresa: { id: 1, nit: 3655579015, razonSocial: "COA CARDONA DE CARDOZO ANTONIA" },
                        latitud: response.data.latitud || 0,
                        longitud: response.data.longitud || 0,
                    });
                    setPreviewUrl(response.data.image);
                    console.log(initialValues);
                } catch (error) {
                    console.error("Error al cargar la sucursal:", error);
                }
            };
            fetchSucursal();
        }
    },[id]);

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
                latitud: values.latitud,
                longitud: values.longitud,
                empresa: values.empresa,
                image: imageUrl,
            }
            let respone;
            if (id){
                respone = await editSucursal(id, sucursalData);
                alerta("Sucursal actualizada", "Guardando cambios...")
            }else{
                respone = await createSucursal(sucursalData);
                alerta("Sucursal creada exitosamente!","Registrando...");
            } 
            resetForm();
            setPreviewUrl(null);
            setSelectedFile(null);
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
                enableReinitialize
                initialValues={initialValues}
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
                        <InputText label="Latitud:" name="latitud" type="number" />
                        <InputText label="Longitud:" name="longitud" type="number" />

                         <div>
                            <button type="submit" className="btn-general" disabled={isSubmitting}
                                    onClick={() => navigate("/sucursales")}
                            >
                                {id ? "Actualizar Sucursal" : "Añadir Sucursal"}
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