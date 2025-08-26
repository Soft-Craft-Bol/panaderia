// components/ClienteForm.jsx
import React from "react";
import { Formik, Form, ErrorMessage } from "formik";
import InputText from "../inputs/InputText";
import SelectSecondary from "../selected/SelectSecondary";
import ButtonPrimary from "../buttons/ButtonPrimary";

export default function ClienteForm({
  initialValues,
  validationSchema,
  onSubmit,
  documentoIdentidad,
  clienteEncontrado,
  buscandoCliente,
  documentoValue,
  handleDocumentChange,
  setSearchTrigger,
  editMode,
  setEditMode,
  isSaving
}) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      key={clienteEncontrado?.id || "new"}
    >
      {({ isSubmitting, errors, touched, values, setFieldValue }) => (
        <Form className="cont-new-pat">
          <div className="input-side">
            <div className="input-group">
              <label htmlFor="numeroDocumento">Número de Documento:</label>
              <div className="search-container">
                <InputText
                  id="numeroDocumento"
                  name="numeroDocumento"
                  type="text"
                  placeholder="Ingrese número de documento"
                  value={values.numeroDocumento}
                  onChange={(e) => handleDocumentChange(e.target.value, setFieldValue)}
                />
                <ButtonPrimary
                  type="button"
                  variant="secondary"
                  disabled={buscandoCliente || !documentoValue}
                  onClick={() => setSearchTrigger(prev => prev + 1)}
                >
                  {buscandoCliente ? "Buscando..." : "Buscar"}
                </ButtonPrimary>
              </div>
              <ErrorMessage name="numeroDocumento" component="div" className="error-message" />
            </div>

            {clienteEncontrado && (
              <>
                <InputText
                  label="Nombre/Razón Social"
                  name="nombreRazonSocial"
                  type="text"
                  placeholder="Ingrese nombre o razón social"
                  disabled={!editMode}
                  value={values.nombreRazonSocial}
                />
                <InputText
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Ingrese email"
                  disabled={!editMode}
                  value={values.email}
                />
                <InputText
                  label="Número de Celular"
                  name="celular"
                  type="text"
                  placeholder="Ingrese número de celular"
                  disabled={!editMode}
                  value={values.celular}
                />
              </>
            )}

            {(!clienteEncontrado || editMode) && (
              <>
                <InputText label="Nombre/Razón Social" name="nombreRazonSocial" />
                <SelectSecondary
                  label="Tipo de Documento"
                  name="codigoTipoDocumentoIdentidad"
                  error={touched.codigoTipoDocumentoIdentidad && errors.codigoTipoDocumentoIdentidad}
                  required
                  value={values.codigoTipoDocumentoIdentidad}
                >
                  <option value="">Seleccione un tipo de documento</option>
                  {documentoIdentidad?.map(doc => (
                    <option key={doc.id} value={Number(doc.codigoClasificador)}>
                      {doc.codigoClasificador} - {doc.descripcion}
                    </option>
                  ))}
                </SelectSecondary>
                <InputText label="Complemento" name="complemento" />
                <InputText label="Código de Cliente" name="codigoCliente" />
                <InputText label="Email" name="email" />
                <InputText label="Número de Celular" name="celular" />
              </>
            )}

            <div className="form-actions">
              {clienteEncontrado && !editMode && (
                <ButtonPrimary type="button" variant="secondary" onClick={() => setEditMode(true)}>
                  Editar Datos
                </ButtonPrimary>
              )}
              {editMode && (
                <ButtonPrimary type="button" variant="secondary" onClick={() => setEditMode(false)}>
                  Cancelar
                </ButtonPrimary>
              )}
              {(editMode || !clienteEncontrado) && (
                <ButtonPrimary type="submit" disabled={isSubmitting || isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Cliente"}
                </ButtonPrimary>
              )}
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
