import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { crearInsumo, updateInsumo, cambiarEstadoInsumo } from '../../service/api';
import InputText from '../../components/inputs/InputText';
import ButtonPrimary from '../../components/buttons/ButtonPrimary';
import SelectPrimary from '../../components/selected/SelectPrimary';
import uploadImageToCloudinary from '../../utils/uploadImageToCloudinary ';
import { FaCamera, FaTimesCircle, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';


const InsumoForm = ({ insumo, onSuccess, onCancel }) => {
  const [previewImage, setPreviewImage] = useState(insumo?.imagen || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEditing = !!insumo;

  const TIPOS_INSUMO = [
    { value: 'MATERIA_PRIMA', label: 'Materia Prima' },
    { value: 'PRODUCTO_TERMINADO', label: 'Producto Terminado' },
    { value: 'EMPAQUE_ETIQUETA', label: 'Empaques y Etiquetas' },
    { value: 'MATERIAL_LIMPIEZA', label: 'Material de Limpieza' }
  ];

  const UNIDADES_MEDIDA = [
    { value: 'kg', label: 'Kilogramos' },
    { value: 'g', label: 'Gramos' },
    { value: 'l', label: 'Litros' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'unidad', label: 'Unidades' },
    { value: 'paquete', label: 'Paquetes' }
  ];

  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .required('Este campo es requerido')
      .max(100, 'Máximo 100 caracteres'),
    tipo: Yup.string()
      .required('Seleccione un tipo de insumo')
      .oneOf(TIPOS_INSUMO.map(t => t.value)),
    precioActual: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('El precio debe ser positivo')
      .min(0.01, 'El precio mínimo es 0.01'),
    cantidad: Yup.number()
      .required('Este campo es requerido')
      .typeError('Debe ser un número')
      .positive('La cantidad debe ser positiva')
      .min(0.01, 'La cantidad mínima es 0.01'),
    unidades: Yup.string()
      .required('Seleccione una unidad de medida')
      .oneOf(UNIDADES_MEDIDA.map(u => u.value)),
    imagen: Yup.string().nullable().max(255, 'Máximo 255 caracteres'),
  });

  const handleImageChange = async (event, setFieldValue) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    try {
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      const url = await uploadImageToCloudinary(file, config);
      setFieldValue('imagen', url);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error subiendo la imagen:', error);
      setPreviewImage(null);
      setFieldValue('imagen', '');
      setUploadProgress(0);
    }
  };

  const handleToggleEstado = async (id, currentEstado) => {
    try {
      await cambiarEstadoInsumo(id, !currentEstado);
      onSuccess();
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditing) {
        await updateInsumo(insumo.id, values);
      } else {
        await crearInsumo(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar insumo:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="insumo-form-container">
      <h2>{isEditing ? 'Editar Insumo' : 'Registrar Nuevo Insumo'}</h2>

      <Formik
        initialValues={{
          nombre: insumo?.nombre || '',
          tipo: insumo?.tipo || '',
          precioActual: insumo?.precioActual || '',
          cantidad: insumo?.cantidad || '',
          unidades: insumo?.unidades || '',
          imagen: insumo?.imagen || '',
          activo: insumo?.activo ?? true
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="form">
            <div className="form-row">
              <div className="file-upload-container">
                <label className="upload-label">Imagen del Insumo (Opcional)</label>

                {!previewImage ? (
                  <div className="upload-box">
                    <input
                      id="imagen"
                      name="imagen"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }} // oculto
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                    />
                    <label htmlFor="imagen" className="upload-label-button">
                      <FaCamera className="upload-icon" />
                      <p>Subir Imagen</p>
                    </label>
                  </div>

                ) : (
                  <div className="image-preview">
                    <img src={previewImage} alt="Previsualización" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFieldValue('imagen', '');
                      }}
                      className="remove-image"
                    >
                      <FaTimesCircle />
                    </button>
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="upload-progress">
                    <progress value={uploadProgress} max="100" />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>

              <div className="form-fields">
                <InputText
                  label="Nombre del Insumo"
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej: Harina de trigo"
                />

                <SelectPrimary
                  label="Tipo de Insumo"
                  name="tipo"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {TIPOS_INSUMO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </SelectPrimary>

                <InputText
                  label="Precio de Presentación"
                  name="precioActual"
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="Ej: 25.50"
                />
              </div>
            </div>

            <div className="form-row">
              <InputText
                label="Unidad de Presentacion"
                name="cantidad"
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="Ej: 25.50"
              />

              <SelectPrimary
                label="Unidad de Medida"
                name="unidades"
                required
              >
                <option value="">Seleccione una unidad</option>
                {UNIDADES_MEDIDA.map(unidad => (
                  <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                ))}
              </SelectPrimary>
            </div>

            {isEditing && (
              <div className="form-actions-extra">
                <button
                  type="button"
                  className="toggle-estado"
                  onClick={() => handleToggleEstado(insumo.id, values.activo)}
                >
                  {values.activo ? (
                    <>
                      <FaToggleOn /> Desactivar Insumo
                    </>
                  ) : (
                    <>
                      <FaToggleOff /> Activar Insumo
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="form-actions">
              <ButtonPrimary
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Insumo'}
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

export default InsumoForm;