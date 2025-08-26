import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { addUser, updateUser, getUserById } from '../../service/api';
import { FaCamera } from '../../hooks/icons';
import { Toaster, toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import './RegisterUser.css';
import { Button } from '../../components/buttons/Button';
import uploadImageToCloudinary from '../../utils/uploadImageToCloudinary ';
import Swal from "sweetalert2";
import { fetchPuntosDeVenta } from '../../service/api';
import { IoCloseOutline } from 'react-icons/io5';
import BackButton from '../../components/buttons/BackButton';

const InputText = lazy(() => import('../../components/inputs/InputText'));

const MemoizedInputText = React.memo(({ label, name, type = "text", required }) => (
  <Suspense fallback={<div>Cargando campo...</div>}>
    <InputText label={label} name={name} type={type} required={required} formik={true} />
  </Suspense>
));

const MemoizedSelectPuntoDeVenta = React.memo(({ puntosDeVenta, value, setFieldValue }) => (
  <div className="form-group">
    <label htmlFor="puntoDeVenta">Punto de Venta Asignado</label>
    <select
      id="puntoDeVenta"
      name="puntoDeVenta"
      value={value || ''}
      onChange={(e) => {
        const selectedId = e.target.value;
        setFieldValue('puntoDeVenta', selectedId);
      }}
    >
      <option value="" disabled>
        Seleccione un punto de venta
      </option>
      {puntosDeVenta.map((punto) => (
        <option key={punto.id} value={punto.id}>
          {punto.nombre} - {punto.sucursal?.nombre || 'Sin sucursal'}
        </option>
      ))}
    </select>
  </div>
));

const alerta = (titulo, mensaje, tipo = "success") => {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: tipo,
    timer: 2500,
    showConfirmButton: false,
  });
}

function UserForm() {
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();

  const [editingUser, setEditingUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Roles disponibles
  const roles = useMemo(() => ['ADMIN', 'PANADERO', 'MAESTRO', 'VENDEDOR', 'CLIENTE'], []);

  const [initialValues, setInitialValues] = useState({
    username: '',
    nombre: '',
    apellido: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    email: '',
    photo: null,
    puntoDeVenta: null,
    roleRequest: {
      roleListName: [],
    },
  });

  const notify = useCallback((message, type = 'success') => {
    type === 'success' ? toast.success(message) : toast.error(message);
  }, []);

  const validationSchema = useMemo(() => {
    const baseSchema = {
      nombre: Yup.string().required('Requerido'),
      apellido: Yup.string().required('Requerido'),
      username: Yup.string().required('Requerido'),
      email: Yup.string().email('Correo inválido').required('Requerido'),
      telefono: Yup.string().required('Requerido'),
      roleRequest: Yup.object({
        roleListName: Yup.array().min(1, 'Seleccione al menos un rol').required('Requerido'),
      }),
      photo: Yup.mixed().nullable(),
      puntoDeVenta: Yup.number().nullable(),
      password: Yup.string().when([], {
        is: () => !id,
        then: schema => schema.min(6, 'Mínimo 6 caracteres').required('Requerido'),
        otherwise: schema => schema.min(6, 'Mínimo 6 caracteres').notRequired(),
      }),
      confirmPassword: Yup.string().when('password', {
        is: val => !!val?.length,
        then: schema => schema
          .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
          .required('Debe confirmar la contraseña'),
        otherwise: schema => schema.notRequired(),
      }),
    };

    return Yup.object(baseSchema);
  }, [id]);


  useEffect(() => {
    const loadPuntosDeVenta = async () => {
      try {
        const response = await fetchPuntosDeVenta();
        setPuntosDeVenta(response.data);
      } catch (error) {
        console.error('Error al cargar los puntos de venta:', error);
      }
    };

    loadPuntosDeVenta();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        console.log('User data:', response.data);
        setEditingUser(response.data);

        // Obtener el primer punto de venta (o null si no hay)
        const puntoVentaId = response.data.puntosVenta?.length > 0
          ? response.data.puntosVenta[0].id
          : null;

        setInitialValues({
          username: response.data.username || '',
          nombre: response.data.firstName || '',
          apellido: response.data.lastName || '',
          password: '',
          confirmPassword: '',
          telefono: response.data.telefono?.toString() || '',
          email: response.data.email || '',
          photo: response.data.photo || null,
          puntoDeVenta: puntoVentaId,
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

  const toggleRole = (role, setFieldValue, currentRoles) => {
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];

    setFieldValue("roleRequest.roleListName", newRoles);
  };

  const handleSubmit = useCallback(async (values, { resetForm }) => {
    let imageUrl = editingUser?.photo || null;

    if (values.photo instanceof File) {
      imageUrl = await uploadImageToCloudinary(values.photo);
    }

    const selectedPuntoDeVenta = puntosDeVenta.find(
      (punto) => punto.id === parseInt(values.puntoDeVenta, 10)
    );

    const userData = {
      username: values.username,
      nombre: values.nombre,
      apellido: values.apellido,
      ...(values.password && { password: values.password }),
      telefono: values.telefono,
      email: values.email,
      photo: imageUrl,
      roleRequest: {
        roleListName: values.roleRequest.roleListName,
      },
      puntosVenta: selectedPuntoDeVenta ? [selectedPuntoDeVenta] : [],
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        alerta("¡Usuario actualizado!", "Los datos del usuario han sido guardados.");
      } else {
        await addUser(userData);
        alerta('Usuario agregado exitosamente', 'El nuevo usuario ha sido registrado.');
      }
      resetForm();
      navigate('/users');
    } catch (error) {
      console.error('Error response:', error.response);
      alerta('Error al procesar la solicitud', error.response?.data?.message || 'Error desconocido', 'error');
    }
  }, [editingUser, navigate, puntosDeVenta]);

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
      <BackButton to="/users" />
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
                  {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
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
                  <MemoizedInputText label="Nombre" name="nombre" required />
                  <MemoizedInputText label="Apellido" name="apellido" required />
                  <MemoizedInputText label="Usuario" name="username" required />
                  <MemoizedInputText label="Teléfono" name="telefono" type="tel" required />
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
                    required={values.password?.length > 0}
                  />
                  <MemoizedInputText label="Correo Electrónico" name="email" type="email" required />

                  {puntosDeVenta.length > 0 && (
                    <MemoizedSelectPuntoDeVenta
                      puntosDeVenta={puntosDeVenta}
                      value={values.puntoDeVenta}
                      setFieldValue={setFieldValue}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="role-selection-group">
              <div className="roles-selector-container">
                <label htmlFor="roles">Seleccionar Roles:</label>
                <select
                  id="roles"
                  onChange={(e) => {
                    const role = e.target.value;
                    if (role) {
                      toggleRole(role, setFieldValue, values.roleRequest.roleListName);
                    }
                  }}
                  value=""
                >
                  <option value="" disabled>Seleccione un rol para agregar</option>
                  {roles
                    .filter(role => !values.roleRequest.roleListName.includes(role))
                    .map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                </select>
              </div>

              <div className="selected-roles-container">
                <h3>Roles asignados:</h3>
                <div className="selected-roles-list">
                  {values.roleRequest.roleListName.length === 0 ? (
                    <p className="no-roles-message">No hay roles seleccionados</p>
                  ) : (
                    values.roleRequest.roleListName.map((role, index) => (
                      <div
                        key={index}
                        className="role-item"
                        onClick={() => toggleRole(role, setFieldValue, values.roleRequest.roleListName)}
                      >
                        {role}
                        <IoCloseOutline size={16} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/users')}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
              >
                {editingUser ? 'Actualizar Usuario' : 'Registrar Usuario'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default React.memo(UserForm);