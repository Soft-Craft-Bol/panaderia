import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';
import { comprarInsumo, getInsumos, getSucursales, getProveedores } from '../../service/api';

const CompraInsumoForm = ({ onSuccess, onCancel }) => {
  const [insumos, setInsumos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState({
    insumos: true,
    sucursales: true,
    proveedores: true
  });

  // Obtener datos necesarios al cargar el componente
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [insumosRes, sucursalesRes, proveedoresRes] = await Promise.all([
        getInsumos(),
        getSucursales(),
        getProveedores()
      ]);

      // Manejar la estructura paginada de insumos
      const insumosData = insumosRes.data?.content || insumosRes.data;
      setInsumos(Array.isArray(insumosData) ? insumosData : []);

      // Sucursales y proveedores son arrays directos
      setSucursales(Array.isArray(sucursalesRes.data) ? sucursalesRes.data : []);
      setProveedores(Array.isArray(proveedoresRes.data) ? proveedoresRes.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Establecer arrays vacíos en caso de error
      setInsumos([]);
      setSucursales([]);
      setProveedores([]);
    } finally {
      setLoading({
        insumos: false,
        sucursales: false,
        proveedores: false
      });
    }
  };

  fetchData();
}, []);

  // Esquema de validación
  const validationSchema = Yup.object().shape({
    insumoId: Yup.number()
      .required('Seleccione un insumo')
      .positive('ID de insumo inválido'),
    sucursalId: Yup.number()
      .required('Seleccione una sucursal')
      .positive('ID de sucursal inválido'),
    proveedorId: Yup.number()
      .required('Seleccione un proveedor')
      .positive('ID de proveedor inválido'),
    cantidad: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('La cantidad debe ser positiva')
      .min(0.01, 'La cantidad mínima es 0.01'),
    precioUnitario: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('El precio debe ser positivo')
      .min(0.01, 'El precio mínimo es 0.01'),
    numeroFactura: Yup.string()
      .required('Este campo es requerido')
      .max(50, 'Máximo 50 caracteres'),
    notas: Yup.string()
      .nullable()
      .max(500, 'Máximo 500 caracteres')
  });

  // Manejar envío del formulario
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await comprarInsumo(values);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al registrar compra:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Verificar si todos los datos están cargados
  const isLoading = loading.insumos || loading.sucursales || loading.proveedores;

  return (
    <div className="form-container">
      <h2>Registrar Compra de Insumo</h2>
      
      <Formik
        initialValues={{
          insumoId: '',
          sucursalId: '',
          proveedorId: '',
          cantidad: '',
          precioUnitario: '',
          numeroFactura: '',
          notas: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="form">
            {isLoading ? (
              <p>Cargando datos necesarios...</p>
            ) : (
              <>
                <SelectPrimary
                  label="Insumo"
                  name="insumoId"
                  required
                >
                  <option value="">Seleccione un insumo</option>
                  {insumos.map(insumo => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.nombre} ({insumo.unidades})
                    </option>
                  ))}
                </SelectPrimary>

                <SelectPrimary
                  label="Sucursal Destino"
                  name="sucursalId"
                  required
                >
                  <option value="">Seleccione una sucursal</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre} - {sucursal.direccion}
                    </option>
                  ))}
                </SelectPrimary>

                <SelectPrimary
                  label="Proveedor"
                  name="proveedorId"
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombreRazonSocial} ({proveedor.tipoProveedor})
                    </option>
                  ))}
                </SelectPrimary>

                <div className="form-row">
                  <div className="form-group">
                    <InputText
                      label="Cantidad"
                      name="cantidad"
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="Ej: 50"
                    />
                  </div>
                  <div className="form-group">
                    <InputText
                      label="Precio Unitario"
                      name="precioUnitario"
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="Ej: 25.50"
                    />
                  </div>
                </div>

                <InputText
                  label="Número de Factura"
                  name="numeroFactura"
                  type="text"
                  required
                  placeholder="Ej: FAC-001-2023"
                />

                <InputText
                  label="Notas (Opcional)"
                  name="notas"
                  type="text"
                  as="textarea"
                  rows="3"
                  placeholder="Ej: Compra regular de harina"
                />
              </>
            )}

            <div className="form-actions">
              <ButtonPrimary 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Compra'}
              </ButtonPrimary>
              
              <ButtonPrimary 
                type="button" 
                variant="secondary" 
                onClick={onCancel}
              >
                Cancelar
              </ButtonPrimary>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CompraInsumoForm;