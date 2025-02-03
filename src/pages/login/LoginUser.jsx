import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './LoginUser.css';
import { Button } from '../../components/buttons/ButtonPrimary';
import { loginUser } from '../../service/api';
import { saveToken, saveUser } from '../../utils/authFunctions';
import ImagenesApp from '../../assets/ImagesApp';

const InputText = lazy(() => import('../../components/inputs/InputText'));

const initialValues = {
  username: '',
  password: '',
};

const validationSchema = Yup.object({
  username: Yup.string().required('El nombre de usuario es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
});

function LoginUser() {
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (values, { setSubmitting }) => {
    setLoginError('');
    try {
      const result = await loginUser({
        username: values.username.trim(), // Asegurar que no haya espacios extras
        password: values.password,
      });
console.log(result);
      if (result?.data?.access_token) {
        saveToken(result.data.access_token);
        saveUser({
          username: result.data.username,
          roles: result.data.roles,
          photo: result.data.photo,
          full_name: result.data.full_name,
        });
        navigate('/home');
      } else {
        setLoginError('Usuario o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      setLoginError(
        error.response?.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : 'Ocurrió un error. Intente más tarde.'
      );
    }
    setSubmitting(false);
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Inicia sesión</h2>
        <Suspense fallback={<div>Cargando imagen...</div>}>
          <img className="logo-fesa" src={ImagenesApp.logo} alt="Logo" height="80px" />
        </Suspense>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Suspense fallback={<div>Cargando campo...</div>}>
                <Field name="username" type="text" placeholder="Nombre de usuario" />
                <ErrorMessage name="username" component="div" className="error-message" />

                <Field name="password" type="password" placeholder="Contraseña" />
                <ErrorMessage name="password" component="div" className="error-message" />
              </Suspense>

              {loginError && <span className="error-message">{loginError}</span>}

              <Link to="/reset">¿Olvidaste la contraseña?</Link>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default React.memo(LoginUser);
