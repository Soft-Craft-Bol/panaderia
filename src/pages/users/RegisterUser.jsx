import React, { useState, useEffect, useCallback, useMemo, lazy } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../components/buttons/ButtonPrimary';
import { useNavigate, useParams } from 'react-router-dom';
import { addUser, updateUser, getUserById } from '../../service/api';
import { FaCamera } from '../../hooks/icons';
import { Toaster, toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import './RegisterUser.css';
import uploadImageToCloudinary from '../../utils/uploadImageToCloudinary ';

const InputText = lazy(() => import('../../components/inputs/InputText'));

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();

  const [editingUser, setEditingUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [initialValues, setInitialValues] = useState({
    username: 'gaspar2',
    nombre: 'Armando',
    apellido: 'Gaspar Mamani',
    password: '1234',
    telefono: '62982552',
    email: 'gaspararmaxndo44@gmail.com',
    photo: null,
    roleRequest: {
      roleListName: ["ADMIN"],
    },
  });

  const roles = ['ADMIN', 'USER', 'INVITED', 'DEVELOPER', 'PANADERO', 'MAESTRO', 'SECRETARIA'];

  // Función de notificación para manejar errores y mensajes de éxito de forma centralizada
  const notify = useCallback((message, type = 'success') => {
    type === 'success' ? toast.success(message) : toast.error(message);
  }, []);

  const validationSchema = useMemo(() => Yup.object({
    nombre: Yup.string().required('Requerido'),
    apellido: Yup.string().required('Requerido'),
    username: Yup.string().required('Requerido'),
    email: Yup.string().email('Correo inválido').required('Requerido'),
    telefono: Yup.string().required('Requerido'),
    password: Yup.string()
      .min(6, 'Mínimo 6 caracteres')
      .required('Requerido'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
      .required('Confirmar contraseña es requerido'),
    roleRequest: Yup.object({
      roleListName: Yup.array().min(1, 'Seleccione al menos un rol').required('Requerido'),
    }),
    photo: Yup.mixed().nullable(),
  }), []);

  // Obtener usuario en caso de edición
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setEditingUser(response.data);
        setInitialValues({
          username: response.data.username || '',
          nombre: response.data.nombre || '',
          apellido: response.data.apellido || '',
          password: '',
          telefono: response.data.telefono || '',
          email: response.data.email || '',
          photo: response.data.photo || null,
          roleRequest: {
            roleListName: response.data.roleRequest?.roleListName || [],
          },
        });

        if (response.data.photo) setPhotoPreview(response.data.photo);
      } catch (error) {
        notify('Error al obtener los datos del usuario.', 'error');
      }
    };

    if (id) fetchUser();
  }, [id, notify]);

  const handleSubmit = useCallback(async (values, { resetForm }) => {
    console.log('Formulario enviado con los siguientes datos:', values);
    
    let imageUrl = editingUser?.photo || null;
  
    if (values.photo instanceof File) {
      imageUrl = await uploadImageToCloudinary(values.photo);
    }
  
    const userData = {
      username: values.username,
      nombre: values.nombre,
      apellido: values.apellido,
      password: values.password,
      telefono: values.telefono,
      email: values.email,
      photo: imageUrl,
      roleRequest: {
        roleListName: values.roleRequest.roleListName,
      },
    };
  
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        notify('Usuario actualizado exitosamente.');
      } else {
        await addUser(userData);
        notify('Usuario agregado exitosamente.');
      }
      resetForm();
      navigate('/userManagement');
    } catch (error) {
      notify('Error al procesar la solicitud.', 'error');
    }
  }, [editingUser, navigate, notify]);
  

  const handlePhotoChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
  
    if (file) {
      setFieldValue('photo', file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
      setFieldValue('photo', null);
    }
  };
  

  return (
    <div className={`user-form-container ${theme}`}>
      <Toaster duration={2000} position="bottom-right" />
      <h2>{editingUser ? 'Editar Usuario' : 'Registrar Usuario'}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form className="form">
            <div className="form-grid">
              <div className="photo-upload-container">
                <div className="photo-preview">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile Preview" />
                  ) : (
                    <FaCamera className="camera-icon" />
                  )}
                </div>
                <label htmlFor="photo" className="photo-label">
                  {photoPreview ? 'Editar Foto' : 'Foto de perfil'}
                </label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handlePhotoChange(event, setFieldValue)}
                />
              </div>
              <div className="form-columns">
                <div className="form-column">
                  <InputText label="Nombre" name="nombre" required />
                  <InputText label="Apellido" name="apellido" required />
                  <InputText label="Usuario" name="username" required />
                  <InputText label="Teléfono" name="telefono" required />
                </div>
                <div className="form-column">
                  <InputText
                    label="Contraseña"
                    name="password"
                    type="password"
                    required={!editingUser}
                  />
                  <InputText
  label="Confirmar Contraseña"
  name="confirmPassword"
  type="password"
  required
/>
                  <InputText label="Correo Electrónico" name="email" required />
                  <div className="roles-container">
                    <label>Roles *</label>
                    {roles.map((role) => (
                      <div key={role} className="role-checkbox">
                        <input
                          type="checkbox"
                          id={role}
                          name="roleRequest.roleListName"
                          value={role}
                          checked={values.roleRequest.roleListName.includes(role)}
                          onChange={(e) => {
                            const { checked, value } = e.target;
                            setFieldValue(
                              'roleRequest.roleListName',
                              checked
                                ? [...values.roleRequest.roleListName, value]
                                : values.roleRequest.roleListName.filter((r) => r !== value)
                            );
                          }}
                        />
                        <label htmlFor={role}>{role}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              type="submit"
              style={{ marginTop: '20px', alignSelf: 'center' }}
            >
              {editingUser ? 'Actualizar' : 'Registrar'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default UserForm;