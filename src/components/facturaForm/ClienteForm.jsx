import React, { useState, useCallback, useRef } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputText from "../inputs/InputText";
import SelectSecondary from "../selected/SelectSecondary";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { buscarCliente, buscarClientePorNombre, createClient, getDocumentoIdentidad } from "../../service/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SearchInput from "../search/SearchInput";
import './ClienteForm.css';

const validationSchema = Yup.object().shape({
  nombreRazonSocial: Yup.string().required('Nombre/Razón Social es requerido'),
  codigoTipoDocumentoIdentidad: Yup.number().required('Tipo de Documento es requerido'),
  numeroDocumento: Yup.string().required('Número de Documento es requerido'),
  complemento: Yup.string(),
  codigoCliente: Yup.string().required('Código de Cliente es requerido'),
  email: Yup.string().email('Email inválido').required('Email es requerido'),
  celular: Yup.string().matches(/^[0-9]+$/, 'Solo se permiten números').required('Celular es requerido'),
});

const searchCache = new Map();

export default function ClienteForm({ onClienteSeleccionado }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [formikSetValues, setFormikSetValues] = useState(null);
  const queryClient = useQueryClient();
  const searchTimeoutRef = useRef(null);

  const initialValues = {
    nombreRazonSocial: '',
    codigoTipoDocumentoIdentidad: '',
    numeroDocumento: '',
    complemento: '',
    codigoCliente: '',
    email: '',
    celular: '',
  };

  const { data: documentoIdentidad } = useQuery({
    queryKey: ['documentosIdentidad'],
    queryFn: getDocumentoIdentidad,
    select: (response) => response.data
  });

  const handleSearch = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSugerencias([]);
      return;
    }

    if (searchCache.has(term)) {
      setSugerencias(searchCache.get(term));
      return;
    }

    setBuscandoCliente(true);
    try {
      const [responseDoc, responseNom] = await Promise.all([
        buscarCliente(term),
        buscarClientePorNombre(term)
      ]);

      const combined = [
        ...(responseDoc.data || []),
        ...(responseNom.data || [])
      ];
      const unique = Array.from(new Map(combined.map(c => [c.id, c])).values());

      searchCache.set(term, unique);
      console.log("Resultados de búsqueda almacenados en caché:", unique);
      setSugerencias(unique);
    } catch (error) {
      console.error("Error buscando cliente:", error);
      setSugerencias([]);
    } finally {
      setBuscandoCliente(false);
    }
  }, []);

  const debouncedSearch = useCallback((term) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (clienteEncontrado) {
      setSugerencias([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(term);
    }, 400);
  }, [clienteEncontrado, handleSearch]);

  const { mutate: saveClient, isPending: isSaving } = useMutation({
    mutationFn: createClient,
    onSuccess: (data) => {
      toast.success('Cliente guardado exitosamente');
      queryClient.invalidateQueries(['cliente']);
      setEditMode(false);
      setClienteEncontrado(data.data);

      if (searchTerm) {
        const cachedResults = searchCache.get(searchTerm) || [];
        searchCache.set(searchTerm, [...cachedResults, data.data]);
      }

      if (onClienteSeleccionado) {
        onClienteSeleccionado(data.data);
      }
    },
    onError: (error) => {
      toast.error('Error al guardar cliente');
      console.error('Error submitting form:', error);
    }
  });

  const handleSelectCliente = (cliente) => {
    setClienteEncontrado(cliente);
    setEditMode(false);
    setSugerencias([]);
    setSearchTerm(cliente.numeroDocumento?.toString() || "");

    if (formikSetValues) {
      formikSetValues({
        nombreRazonSocial: cliente.nombreRazonSocial || "",
        codigoTipoDocumentoIdentidad: cliente.codigoTipoDocumentoIdentidad || "",
        numeroDocumento: cliente.numeroDocumento || "",
        complemento: cliente.complemento || "",
        codigoCliente: cliente.codigoCliente || "",
        email: cliente.email || "",
        celular: cliente.celular || ""
      });
    }

    if (onClienteSeleccionado) {
      onClienteSeleccionado(cliente);
    }
  };

  const handleSubmit = async (values) => {
    const clientData = {
      nombreRazonSocial: values.nombreRazonSocial || '',
      codigoTipoDocumentoIdentidad: Number(values.codigoTipoDocumentoIdentidad) || 0,
      numeroDocumento: values.numeroDocumento || '',   // 👈 OJO
      complemento: values.complemento || '',
      codigoCliente: values.codigoCliente || '',
      email: values.email || '',
      celular: values.celular || ''
    };

    saveClient(clientData);
  };

  const handleClearSearch = () => {
    setClienteEncontrado(null);
    setSearchTerm("");
    setSugerencias([]);

    if (formikSetValues) {
      formikSetValues(initialValues);
    }
  };

  return (
    <div className="cliente-form-container">
      <h3>Datos del Cliente</h3>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched, values, setValues, setFieldValue }) => {
          if (!formikSetValues) {
            setFormikSetValues(() => setValues);
          }

          return (
            <>
              <div className="search-container">
                <SearchInput
                  value={searchTerm}
                  onSearch={debouncedSearch}
                  onChange={(val) => {
                    setSearchTerm(val);
                    debouncedSearch(val);
                  }}
                  placeholder="Buscar cliente por nombre o documento"
                  disabled={!!clienteEncontrado}
                />
              </div>

              {buscandoCliente && (
                <div className="loading-indicator">Buscando...</div>
              )}

              {sugerencias.length > 0 && (
                <ul className="sugerencias-lista">
                  {sugerencias.map((cliente) => (
                    <li
                      key={cliente.id}
                      className="sugerencia-item"
                      onClick={() => handleSelectCliente(cliente)}
                    >
                      <span className="sugerencia-nombre">{cliente.nombreRazonSocial}</span> –{" "}
                      <span className="sugerencia-documento">{cliente.numeroDocumento}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Form className="cont-new-pat">
                {!editMode && clienteEncontrado && (
                  <>
                    {/* Grupo de Información Básica */}
                    <div className="form-section">
                      <h4 className="form-section-title">Información Básica</h4>
                      <div className="input-group-grid">
                        <InputText
                          label="Nombre/Razón Social"
                          name="nombreRazonSocial"
                          type="text"
                          placeholder="Ingrese nombre o razón social"
                          disabled={true}
                          value={values.nombreRazonSocial}
                        />
                        <InputText
                          label="Código de Cliente"
                          name="codigoCliente"
                          type="text"
                          placeholder="Código de cliente"
                          disabled={true}
                          value={values.codigoCliente}
                        />
                      </div>
                    </div>

                    {/* Grupo de Documentación */}
                    <div className="form-section">
                      <h4 className="form-section-title">Documentación</h4>
                      <div className="input-group-grid">
                        <SelectSecondary
                          label="Tipo de Documento"
                          name="codigoTipoDocumentoIdentidad"
                          error={touched.codigoTipoDocumentoIdentidad && errors.codigoTipoDocumentoIdentidad}
                          required
                          disabled={true}
                          value={values.codigoTipoDocumentoIdentidad}
                        >
                          <option value="">Seleccione un tipo de documento</option>
                          {documentoIdentidad?.map(doc => (
                            <option key={doc.id} value={Number(doc.codigoClasificador)}>
                              {doc.codigoClasificador} - {doc.descripcion}
                            </option>
                          ))}
                        </SelectSecondary>

                        <div className="input-group">
                          <label htmlFor="numeroDocumento">Número de Documento:</label>
                          <InputText
                            id="numeroDocumento"
                            name="numeroDocumento"
                            type="text"
                            placeholder="Ingrese número de documento (con complemento: 1234567-1A)"
                            value={values.numeroDocumento}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setFieldValue("numeroDocumento", e.target.value);
                              debouncedSearch(e.target.value);
                            }}
                            disabled={!!clienteEncontrado && !editMode}
                          />
                          <ErrorMessage name="numeroDocumento" component="div" className="error-message" />
                        </div>

                        <InputText
                          label="Complemento"
                          name="complemento"
                          type="text"
                          placeholder="Complemento"
                          disabled={true}
                          value={values.complemento}
                        />
                      </div>
                    </div>

                    {/* Grupo de Contacto */}
                    <div className="form-section">
                      <h4 className="form-section-title">Información de Contacto</h4>
                      <div className="input-group-grid">
                        <InputText
                          label="Email"
                          name="email"
                          type="email"
                          placeholder="Ingrese email"
                          disabled={true}
                          value={values.email}
                        />
                        <InputText
                          label="Número de Celular"
                          name="celular"
                          type="text"
                          placeholder="Ingrese número de celular"
                          disabled={true}
                          value={values.celular}
                        />
                      </div>
                    </div>
                  </>
                )}

                {editMode && (
                  <>
                    {/* Grupo de Información Básica (Modo Edición) */}
                    <div className="form-section">
                      <h4 className="form-section-title">Información Básica</h4>
                      <div className="input-group-grid">
                        <InputText
                          label="Nombre/Razón Social"
                          name="nombreRazonSocial"
                          error={touched.nombreRazonSocial && errors.nombreRazonSocial}
                          placeholder="Ingrese nombre o razón social"
                        />
                        <InputText
                          label="Código de Cliente"
                          name="codigoCliente"
                          error={touched.codigoCliente && errors.codigoCliente}
                          placeholder="Ingrese código de cliente"
                        />
                      </div>
                    </div>

                    {/* Grupo de Documentación (Modo Edición) */}
                    <div className="form-section">
                      <h4 className="form-section-title">Documentación</h4>
                      <div className="input-group-grid">
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

                        <div className="input-group">
                          <label htmlFor="numeroDocumento">Número de Documento:</label>
                          <InputText
                            id="numeroDocumento"
                            name="numeroDocumento"
                            type="text"
                            placeholder="Ingrese número de documento (con complemento: 1234567-1A)"
                            value={values.numeroDocumento}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setFieldValue("numeroDocumento", e.target.value);
                              debouncedSearch(e.target.value);
                            }}
                          />
                          <ErrorMessage name="numeroDocumento" component="div" className="error-message" />
                        </div>

                        <InputText
                          label="Complemento"
                          name="complemento"
                          error={touched.complemento && errors.complemento}
                          placeholder="Ingrese complemento si aplica"
                        />
                      </div>
                    </div>

                    {/* Grupo de Contacto (Modo Edición) */}
                    <div className="form-section">
                      <h4 className="form-section-title">Información de Contacto</h4>
                      <div className="input-group-grid">
                        <InputText
                          label="Email"
                          name="email"
                          error={touched.email && errors.email}
                          placeholder="Ingrese email"
                        />
                        <InputText
                          label="Número de Celular"
                          name="celular"
                          error={touched.celular && errors.celular}
                          placeholder="Ingrese número de celular"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  {clienteEncontrado && !editMode && (
                    <>
                      <ButtonPrimary type="button" variant="secondary" onClick={() => setEditMode(true)}>
                        Editar Datos
                      </ButtonPrimary>
                      <ButtonPrimary type="button" variant="secondary" onClick={handleClearSearch}>
                        Buscar Otro Cliente
                      </ButtonPrimary>
                    </>
                  )}
                  {editMode && (
                    <>
                      <ButtonPrimary type="button" variant="secondary" onClick={() => setEditMode(false)}>
                        Cancelar
                      </ButtonPrimary>
                      <ButtonPrimary type="submit" disabled={isSubmitting || isSaving}>
                        {isSaving ? "Guardando..." : "Guardar Cliente"}
                      </ButtonPrimary>
                    </>
                  )}
                  {!clienteEncontrado && !editMode && (
                    <ButtonPrimary type="button" variant="primary" onClick={() => setEditMode(true)}>
                      Crear Nuevo Cliente
                    </ButtonPrimary>
                  )}
                </div>
              </Form>
            </>
          );
        }}
      </Formik>
    </div>
  );
}