import React, { useState, useCallback, useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { addUser, loginUser } from '../../../service/api';
import { saveToken, saveUser } from '../../../utils/authFunctions';
import { parseJwt } from '../../../utils/Auth';
import { Toaster, toast } from 'sonner';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../buttons/Button';
import Swal from "sweetalert2";
import './RegisterClient.css';
import NavbarPublic from '../../sidebar/NavbarPublic';
import Footer from '../../../pages/landingPage/Footer';

const InputText = React.lazy(() => import('../../inputs/InputText'));

// Componente memoizado para InputText
const MemoizedInputText = React.memo(({ label, name, type = "text", required }) => (
  <React.Suspense fallback={<div>Cargando campo...</div>}>
    <InputText label={label} name={name} type={type} required={required} formik={true} />
  </React.Suspense>
));

const alerta = (titulo, mensaje, tipo = "success") => {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: tipo,
    timer: 2500,
    showConfirmButton: false,
  });
};

function RegisterClient() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const location = useLocation();
  const isPublicRoute = location.pathname === "/register-client";

  const initialValues = {
    username: '',
    nombre: '',
    apellido: '',
    password: '',
    telefono: '',
    email: '',
    roleRequest: {
      roleListName: ["CLIENTE"], // Rol fijo para clientes
    },
  };

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
  }), []);

  const handleSubmit = useCallback(async (values, { resetForm }) => {
    const userData = {
      username: values.username,
      nombre: values.nombre,
      apellido: values.apellido,
      password: values.password,
      telefono: values.telefono,
      email: values.email,
      roleRequest: {
        roleListName: values.roleRequest.roleListName,
      },
    };

    try {
      await addUser(userData);
      alerta('Registro exitoso', 'Bienvenido/a a nuestro sistema');

      // Auto-login después del registro si es ruta pública
      if (isPublicRoute) {
        try {
          const loginResult = await loginUser({
            username: userData.username.trim(),
            password: userData.password,
          });

          if (loginResult?.data?.jwt) {
            const token = loginResult.data.jwt;
            const decodedToken = parseJwt(token);
            const roles = decodedToken?.authorities?.split(',') || [];

            saveToken(token);
            saveUser({
              username: loginResult.data.username,
              roles: roles,
            });

            navigate('/'); // Redirige a la página principal
          }
        } catch (error) {
          console.error('Error en el auto-login:', error);
        }
      } else {
        navigate('/users'); // Redirige a la lista de usuarios si es ruta privada
      }

      resetForm();
    } catch (error) {
      console.error('Error en el registro:', error);
      alerta('Error en el registro', error.response?.data?.message || 'Ocurrió un error', 'error');
    }
  }, [isPublicRoute, navigate]);

  return (
    <>
    <NavbarPublic />
        <div className={`register-client-container ${theme}`}>
      <Toaster duration={2000} position="bottom-right" />
      <h2>{isPublicRoute ? 'Registro de Cliente' : 'Crear Nuevo Cliente'}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="client-form">
          <div className="form-columns">
            <div className="form-column">
              <MemoizedInputText label="Nombre" name="nombre" required />
              <MemoizedInputText label="Apellido" name="apellido" required />
              <MemoizedInputText label="Usuario" name="username" required />
            </div>
            <div className="form-column">
              <MemoizedInputText label="Correo Electrónico" name="email" required />
              <MemoizedInputText label="Teléfono" name="telefono" required />
              <MemoizedInputText
                label="Contraseña"
                name="password"
                type="password"
                required
              />
              <MemoizedInputText
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
          </div>
          <Button
            variant="primary"
            type="submit"
            style={{ marginTop: '20px', alignSelf: 'center' }}
          >
            {isPublicRoute ? 'Registrarse' : 'Crear Cliente'}
          </Button>
        </Form>
      </Formik>
    </div>
    <Footer />
    </>
  );
}

export default React.memo(RegisterClient);