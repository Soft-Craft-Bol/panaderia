import React, { useState, useEffect, useCallback, useMemo, lazy } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import SelectPrimary from '../../components/selected/SelectPrimary';
import { Button } from '../../components/buttons/ButtonPrimary';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoles, addUser, updateUser, getUserById } from '../../service/api';
import { FaCamera } from '../../hooks/icons';
import { Toaster, toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import './RegisterUser.css';

const InputText = lazy(() => import('../../components/inputs/InputText'));

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();

  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [initialValues, setInitialValues] = useState({
    username: '',
    password: '',
    email: '',
    telefono: '',
    nombre: '',
    apellido: '',
    confirmPassword: '',
    roleRequest: '',
    photo: null,
  });

  // Función de notificación para manejar errores y mensajes de éxito de forma centralizada
  const notify = useCallback((message, type = 'success') => {
    type === 'success' ? toast.success(message) : toast.error(message);
  }, []);

  // Esquema de validación, optimizado con `useMemo` para evitar recrearlo en cada render
  const validationSchema = useMemo(() => Yup.object({
    name: Yup.string().required('Requerido'),
    last_name: Yup.string().required('Requerido'),
    username: Yup.string().required('Requerido'),
    email: Yup.string().email('Correo inválido').required('Requerido'),
    phone: Yup.string().required('Requerido'),
    password: Yup.string()
      .min(6, 'Mínimo 6 caracteres')
      .when('editingUser', {
        is: false,
        then: Yup.string().required('Requerido'),
      }),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
      .when('editingUser', {
        is: false,
        then: Yup.string().required('Requerido'),
      }),
    role: Yup.string().nullable().required('Requerido'),
    photo: Yup.mixed().nullable(),
  }), []);

  // Obtener roles y usuario en caso de edición
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data.map((rol) => ({
          value: rol.id,
          label: rol.name,
        })));
      } catch (error) {
        notify('Error al obtener los roles.', 'error');
      }
    };

    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setEditingUser(response.data);
        setInitialValues({
          name: response.data.name || '',
          last_name: response.data.last_name || '',
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          password: '',
          confirmPassword: '',
          role: response.data.role || '',
          photo: response.data.photo || null,
        });

        if (response.data.photo) setPhotoPreview(response.data.photo);
      } catch (error) {
        notify('Error al obtener los datos del usuario.', 'error');
      }
    };

    fetchRoles();
    if (id) fetchUser();
  }, [id, notify]);

  // Función de envío, optimizada con `useCallback`
  const handleSubmit = useCallback(async (values, { resetForm }) => {
    console.log('Formulario enviado con los siguientes datos:', values); 
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key] !== null) formData.append(key, values[key]);
    });

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        notify('Usuario actualizado exitosamente.');
      } else {
        await addUser(formData);
        notify('Usuario agregado exitosamente.');
      }
      resetForm();
      navigate('/userManagement');
    } catch (error) {
      notify('Error al procesar la solicitud.', 'error');
    }
  }, [editingUser, navigate, notify]);

  // Manejar el cambio de foto
  const handlePhotoChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue('photo', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
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
        {({ setFieldValue }) => (
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
                  <InputText label="Nombre" name="name" required />
                  <InputText label="Apellido" name="last_name" required />
                  <InputText label="Usuario" name="username" required />
                  <InputText label="Teléfono" name="phone" required />
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
                    required={!editingUser}
                  />
                  <InputText label="Correo Electrónico" name="email" required />
                  <SelectPrimary label="Roles" name="role" required>
                    <option value="">Seleccione un tipo de usuario</option>
                    {roles.map((rol) => (
                      <option key={rol.value} value={rol.value}>
                        {rol.label}
                      </option>
                    ))}
                  </SelectPrimary>
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
