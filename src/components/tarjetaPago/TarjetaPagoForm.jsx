import React from 'react';
import InputText from '../inputs/InputText';

const TarjetaPagoForm = ({ 
  values, 
  errors, 
  touched, 
  setFieldValue, 
  setFieldTouched 
}) => {
  // Función para manejar el cambio de fecha de expiración
  const handleExpirationChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFieldValue('expiracionTarjeta', value);
  };

  return (
    <>
      <h3>Información de la tarjeta</h3>
      
      <InputText
        label="Número de tarjeta"
        name="numeroTarjeta"
        value={values.numeroTarjeta}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 16);
          setFieldValue('numeroTarjeta', value);
        }}
        onBlur={() => setFieldTouched('numeroTarjeta', true)}
        error={touched.numeroTarjeta && errors.numeroTarjeta}
        placeholder="1234 5678 9012 3456"
      />

      <InputText
        label="Nombre en la tarjeta"
        name="nombreTarjeta"
        value={values.nombreTarjeta}
        onChange={(e) => setFieldValue('nombreTarjeta', e.target.value)}
        onBlur={() => setFieldTouched('nombreTarjeta', true)}
        error={touched.nombreTarjeta && errors.nombreTarjeta}
      />

      <InputText
        label="Fecha de expiración (MM/YY)"
        name="expiracionTarjeta"
        value={values.expiracionTarjeta}
        onChange={handleExpirationChange}
        onBlur={() => setFieldTouched('expiracionTarjeta', true)}
        error={touched.expiracionTarjeta && errors.expiracionTarjeta}
        placeholder="MM/YY"
        maxLength={5}
      />

      <InputText
        label="CVV"
        name="cvvTarjeta"
        type="password"
        value={values.cvvTarjeta}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
          setFieldValue('cvvTarjeta', value);
        }}
        onBlur={() => setFieldTouched('cvvTarjeta', true)}
        error={touched.cvvTarjeta && errors.cvvTarjeta}
        maxLength={4}
      />
    </>
  );
};

export default TarjetaPagoForm;