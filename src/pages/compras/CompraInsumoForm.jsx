import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';
import { comprarInsumo, getProveedores, updateCompraInsumo } from '../../service/api';
import { toast, Toaster } from 'sonner';
import CustomDatePicker from '../../components/inputs/DatePicker';

const CompraInsumoForm = ({ insumoId, insumoNombre, sucursalId, onSuccess, onCancel, compra }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState({
    insumos: true,
    sucursales: true,
    proveedores: true
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const proveedoresRes = await getProveedores();
        setProveedores(Array.isArray(proveedoresRes.data) ? proveedoresRes.data : []);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setProveedores([]);
      } finally {
        setLoading({ proveedores: false });
      }
    };

    fetchData();
  }, []);

  const validationSchema = Yup.object().shape({
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
      .max(500, 'Máximo 500 caracteres'),
    fechaVencimiento: Yup.date()
  .nullable()
  .min(new Date(), 'La fecha de vencimiento no puede ser anterior a hoy')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    const compraData = {
      ...values,
      insumoId: insumoId || values.insumoId,
      sucursalId: sucursalId || values.sucursalId,
    };
    
    if (compra?.id) {
      await updateCompraInsumo(compra.id, compraData);
      toast.success('Compra actualizada correctamente');
      if (onSuccess) onSuccess(compraData); 
    } else {
      await comprarInsumo(compraData);
      toast.success('Compra registrada correctamente');
      if (onSuccess) onSuccess();
    }
    resetForm();
  } catch (error) {
    console.error('Error al registrar compra:', error);
    toast.error('Error al procesar la compra');
  } finally {
    setSubmitting(false);
  }
};

  const isLoading = loading.insumos || loading.sucursales || loading.proveedores;

  return (
    <div className="form-container">
    <Toaster richColors position="top-right" />
      <h2>{compra ? 'Editar Compra' : 'Registrar Compra de Insumo'}</h2>
      {(insumoId && insumoNombre) && (
        <div className="selected-insumo-info">
          <p><strong>Insumo seleccionado:</strong> {insumoNombre}</p>
          {sucursalId && <p><strong>Sucursal destino:</strong> {sucursalId}</p>}
        </div>
      )}

      <Formik
        initialValues={{
          insumoId: compra?.insumoId || '',
          sucursalId: compra?.sucursalId || '',
          fechaVencimiento: compra?.fechaVencimiento || null,
          proveedorId: compra?.proveedorId || '',
          cantidad: compra?.cantidad || '',
          precioUnitario: compra?.precioUnitario || '',
          numeroFactura: compra?.numeroFactura || '',
          notas: compra?.notas || ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="form">
            {isLoading ? (
              <p>Cargando datos necesarios...</p>
            ) : (
              <>
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
                 <CustomDatePicker
              label="Fecha de Vencimiento (Opcional)"
              name="fechaVencimiento"
              selected={values.fechaVencimiento}
              onChange={(date) => setFieldValue('fechaVencimiento', date)}
              minDate={new Date()}
              placeholderText="Seleccione una fecha"
              isClearable
              showYearDropdown
              dropdownMode="select"
            />
              </>
            )}

            <div className="form-actions">
              <ButtonPrimary 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting 
                  ? (compra ? 'Actualizando...' : 'Registrando...') 
                  : (compra ? 'Actualizar Compra' : 'Registrar Compra')}
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