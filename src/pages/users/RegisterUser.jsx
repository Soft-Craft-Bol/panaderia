import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addUser, updateUser, getUserById } from '../../service/api';
import { FaCamera } from '../../hooks/icons';
import { Toaster, toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import './RegisterUser.css';
import { Button } from '../../components/buttons/Button';
import Modal from '../../components/modal/Modal';
import uploadImageToCloudinary from '../../utils/uploadImageToCloudinary ';
import Swal from "sweetalert2";

const InputText = lazy(() => import('../../components/inputs/InputText'));

// Componente memoizado para InputText
const MemoizedInputText = React.memo(({ label, name, type = "text", required }) => (
  <Suspense fallback={<div>Cargando campo...</div>}>
    <InputText label={label} name={name} type={type} required={required} formik={true} />
  </Suspense>
));

const alerta = (titulo, mensaje, tipo =  "success") =>{
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: tipo, 
    timer: 2500,
    showConfirmButton: false,
  });
}

// Componente para el modal de selección de roles
const RoleSelectionModal = React.memo(({ isOpen, onClose, roles, selectedRoles, setFieldValue }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Seleccionar Roles</h3>
      <div className="roles-container">
        {roles.map((role) => {
          const isSelected = selectedRoles.includes(role);
          return (
            <div
              key={role}
              className={`role-checkbox ${isSelected ? "selected" : ""}`}
              onClick={() => {
                const newRoles = isSelected
                  ? selectedRoles.filter((r) => r !== role) // Desmarcar
                  : [...selectedRoles, role]; // Marcar
                setFieldValue("roleRequest.roleListName", newRoles);
              }}
            >
              <input
                type="checkbox"
                id={role}
                name="roleRequest.roleListName"
                value={role}
                checked={isSelected}
                onChange={(e) => {
                  const { checked, value } = e.target;
                  setFieldValue(
                    "roleRequest.roleListName",
                    checked
                      ? [...selectedRoles, value]
                      : selectedRoles.filter((r) => r !== value)
                  );
                }}
              />
              <label htmlFor={role}>{role}</label>
            </div>
          );
        })}
      </div>
      <Button
        variant="primary"
        type="button"
        onClick={onClose}
        style={{ marginTop: "20px" }}
      >
        Cerrar
      </Button>
    </Modal>
  );
});

function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();

  const [editingUser, setEditingUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const location = useLocation();
  const isPublicRoute = location.pathname === "/register";

  const roles = useMemo(() => ['ADMIN', 'USER', 'INVITED', 'DEVELOPER', 'PANADERO', 'MAESTRO', 'SECRETARIA', 'VENDEDOR', 'CLIENTE'], []);

  const [initialValues, setInitialValues] = useState({
    username: '',
    nombre: '',
    apellido: '',
    password: '',
    telefono: '',
    email: '',
    photo: null,
    roleRequest: {
      roleListName: isPublicRoute ? ["USER"] : [], // Si es ruta pública, solo 'USER'
    },
  });

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setEditingUser(response.data);
        console.log(response.data);
        setInitialValues({
          username: response.data.username || '',
          nombre: response.data.firstName || '',
          apellido: response.data.lastName || '',
          password: '',
          telefono: response.data.telefono || '',
          email: response.data.email || '',
          photo: response.data.photo || null,
          roleRequest: {
            roleListName: response.data.roles || [],
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
        console.log(userData);
        await updateUser(editingUser.id, userData);
        alerta("¡Usuario actualizado!", "Guardando datos ...", )
      } else {
        await addUser(userData);
        alerta('Usuario agregado exitosamente', "Bienvenido");
      }
      resetForm();
      navigate('/users');
    } catch (error) {
      console.error('Error response:', error.response);
      alerta('Error al procesar la solicitud', error, 'error');
    }
  }, [editingUser, navigate, notify]);

  const handlePhotoChange = useCallback((event, setFieldValue) => {
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
  }, []);

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
            {!isPublicRoute && (
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
              )}
              </div>
              <div className="photo-upload-container">
                
              <div className="form-columns">
                <div className="form-column">
                  <MemoizedInputText label="Nombre" name="nombre" required />
                  <MemoizedInputText label="Apellido" name="apellido" required />
                  <MemoizedInputText label="Usuario" name="username" required />
                  <MemoizedInputText label="Teléfono" name="telefono" required />
                </div>
                <div className="form-column">
                  <MemoizedInputText
                    label="Contraseña"
                    name="password"
                    type="password"
                    required={!editingUser}
                  />
                  <MemoizedInputText
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                  <MemoizedInputText label="Correo Electrónico" name="email" required />
                  {!isPublicRoute && ( // Oculta el botón si es ruta pública
                    <Button variant="primary" type="button" onClick={() => setIsRoleModalOpen(true)} style={{ marginTop: "10px" }}>
                      Seleccionar Roles
                    </Button>
                  )}
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

            <RoleSelectionModal
              isOpen={isRoleModalOpen}
              onClose={() => setIsRoleModalOpen(false)}
              roles={roles}
              selectedRoles={values.roleRequest.roleListName}
              setFieldValue={setFieldValue}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default React.memo(UserForm);