import React, { useState, useCallback, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import './LoginUser.css';
import { Button } from '../../components/buttons/ButtonPrimary';
import { loginUser } from '../../service/api';
import { saveToken, saveUser } from '../../utils/authFunctions';
import ImagenesApp from '../../assets/ImagesApp';
import { parseJwt } from '../../utils/Auth';
import InputText from '../../components/inputs/InputText';


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
            username: values.username.trim(),
            password: values.password,
          });
      
          if (result?.data?.jwt) {
            const token = result.data.jwt;
            const decodedToken = parseJwt(token);
            const roles = decodedToken?.authorities?.split(',') || []; // Extraer roles del token
      
            saveToken(token);
            saveUser({
              username: result.data.username,
              roles: roles, // Guardamos los roles
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
            <img className="logo-fesa" src={ImagenesApp.inpased} alt="Inpased" height="100px" />
            <div className="login-form">
                <h1>Inicia sesión</h1>
                <Suspense fallback={<div>Cargando imagen...</div>}>
                    <img className="logo-fesa" src={ImagenesApp.logo} alt="Logo" height="80px" />
                </Suspense>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form style={{ flexDirection: "column" }}>
                            <Suspense fallback={<div>Cargando campo...</div>}>
                                <InputText name="username" placeholder="Introduzca su nombre de usuario" label={"Nombre de usuario"} />
                                <InputText name="password" type="password" placeholder="Introduzca su contraseña" label={"Contraseña"}/>
                            </Suspense>
                            <div>
                                {loginError && <span className="error-message">{loginError}</span>}
                                <Link to="/reset">¿Olvidaste la contraseña?</Link>
                                <Button type="submit" variant="primary" disabled={isSubmitting} className="btn-general">
                                    {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default React.memo(LoginUser);
