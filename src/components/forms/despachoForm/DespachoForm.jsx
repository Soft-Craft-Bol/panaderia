import React from 'react'
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup'; 
import InputText from '../../inputs/InputText';
import './DespachoForm.css';

export default function DespachoForm() {
  return (
    <div className='despachos-contenedor'>
      <h1>Datos del despacho:</h1>
      <div className='number-comment'>
        <Formik
          initialValues={{
            origin: '',
            destination: '',
            date: new Date().toISOString().split('T')[0], // Fecha actual por default
            transportId: '',
            numberPhone: '',
            comment: '',
          }}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          <Form>
            {/* Primera fila: Origen y Destino */}
            <div className="form-group">
              <div>
                <label htmlFor="origin">Origen:</label>
                <Field as="select" name="origin" id="origin" className="despacho-input">
                  <option value="" disabled selected>Seleccione un origen</option>
                  <option value="opcion1">Opción 1</option>
                  <option value="opcion2">Opción 2</option>
                </Field>
              </div>

              <div>
                <label htmlFor="destination">Destino:</label>
                <Field as="select" name="destination" id="destination" className="despacho-input">
                  <option value="" disabled selected>Seleccione un destino</option>
                  <option value="opcion1">Opción 1</option>
                  <option value="opcion2">Opción 2</option>
                </Field>
              </div>
            </div>

                
                <InputText
                label="Fecha actual:"
                name="date"
                type='text'
                readOnly
                />
              
                <label htmlFor="transportId">ID Transporte:</label>
                <Field as="select" name="transportId" id="transportId" className="despacho-input">
                  <option value="" disabled selected>Seleccione transporte</option>
                  <option value="logistica1">Logística 1</option>
                  <option value="logistica2">Logística 2</option>
                </Field>

            <div className="form-group">
              <InputText
                label="Número de emergencia:"
                name="numberPhone"
                type="text"
                id="numberPhone"
                placeholder="En caso de que algo pase con el envío"
              />

              <InputText
                label="Comentario:"
                name="comment"
                type="text"
                id="comment"
                placeholder="Deje algún comentario respecto al envío"
              />
            </div>

            {/* Botón de envío */}
            <div>
              <button type="submit" className='btn-general'>Enviar</button>
            </div>

          </Form>
        </Formik>
      </div>
    </div>
  )
}
