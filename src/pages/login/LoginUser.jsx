import React, { useState, useCallback, Suspense, useEffect, lazy, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import './LoginUser.css';
import { loginUser } from '../../service/api';
import { saveToken, saveUser } from '../../utils/authFunctions';
import { parseJwt } from '../../utils/Auth';
import loadImage from '../../assets/ImagesApp';

const Button = lazy(() => import('../../components/buttons/ButtonPrimary'));
const InputText = lazy(() => import('../../components/inputs/InputText'));


const initialValues = {
  username: '',
  password: '',
};

const validationSchema = Yup.object({
  username: Yup.string().required('El nombre de usuario es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
});

const useImageLoader = (imageName) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadImage(imageName).then((img) => setImage(img.default));
  }, [imageName]);

  return image;
};

const MemoizedInputText = memo(({ name, placeholder, label, type = "text" }) => (
  <Suspense fallback={<div>Cargando campo...</div>}>
    <InputText name={name} placeholder={placeholder} label={label} type={type} />
  </Suspense>
));

const LoginUser = () => {
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const inpased = useImageLoader("inpased");
  const logo = useImageLoader("logo");

  const handleSubmit = useCallback(async (values, { setSubmitting }) => {
    setLoginError('');
    try {
      const result = await loginUser({
        username: values.username.trim(),
        password: values.password,
      });

      if (result?.data?.jwt) {
        const token = result.data.jwt;
        const decodedToken = parseJwt(token);
        const roles = decodedToken?.authorities?.split(',') || [];

        saveToken(token);
        saveUser({
          username: result.data.username,
          roles: roles,
          photo: result.data.photo,
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
      <Suspense fallback={<p>Cargando imagen...</p>}>
        {inpased && <img className="logo-fesa" src={inpased} alt="Inpased" height="100px" />}
      </Suspense>
      <div className="login-form">
        <h1>Inicia sesión</h1>
        <Suspense fallback={<div>Cargando imagen...</div>}>
          {logo && <img className="logo-fesa" src={logo} alt="Logo" height="80px" />}
        </Suspense>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form style={{ flexDirection: "column" }}>
              <MemoizedInputText name="username" placeholder="Introduzca su nombre de usuario" label="Nombre de usuario" />
              <MemoizedInputText name="password" type="password" placeholder="Introduzca su contraseña" label="Contraseña" />

              <div>
                {loginError && <span className="error-message">{loginError}</span>}
                <Link to="/reset">¿Olvidaste la contraseña?</Link>
                <Suspense fallback={<div>Cargando botón...</div>}>
                  <Button type="submit" variant="primary" disabled={isSubmitting} className="btn-general">
                    {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                  </Button>
                </Suspense>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default memo(LoginUser);