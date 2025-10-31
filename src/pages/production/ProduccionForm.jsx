import React, { useState, useEffect } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getRecetasByPage, createProduccion } from "../../service/api";
import SelectorRecetasPaginado from "../../components/selected/SelectorRecetasPaginado";
import InputText from "../../components/inputs/InputText";
import TextArea from "../../components/inputs/TextArea";
import { Button } from "../../components/buttons/Button";
import { toast, Toaster } from "sonner";
import "./ProduccionForm.css";
import { getUser } from "../../utils/authFunctions";
import InsumoSelector from "./InsumoSelector";
import ToggleSwitch from "../../components/toogle/ToggleSwitch";

const UnidadesLotesSync = ({ selectedReceta, porcentajeLote, setPorcentajeLote }) => {
  const { values, setFieldValue } = useFormikContext();
  const [unidadesTotales, setUnidadesTotales] = useState(selectedReceta?.cantidadUnidades || 0);

  useEffect(() => {
    if (selectedReceta && values.cantidad) {
      const nuevasUnidades = values.cantidad * selectedReceta.cantidadUnidades;
      setUnidadesTotales(Math.round(nuevasUnidades));
      setPorcentajeLote(values.cantidad * 100);
    }
  }, [values.cantidad, selectedReceta]);

  useEffect(() => {
    if (selectedReceta && unidadesTotales > 0) {
      const nuevosLotes = unidadesTotales / selectedReceta.cantidadUnidades;
      setFieldValue('cantidad', parseFloat(nuevosLotes.toFixed(2)));
      setPorcentajeLote(nuevosLotes * 100);
    }
  }, [unidadesTotales, selectedReceta]);

  return (
    <div className="cantidad-controls">
      <div className="form-group">
        <label>Porcentaje del lote *</label>
        <div className="percentage-input">
          <input
            type="range"
            min="1"
            max="500"
            value={porcentajeLote}
            onChange={(e) => {
              const porcentaje = parseFloat(e.target.value);
              setPorcentajeLote(porcentaje);
              setFieldValue('cantidad', porcentaje / 100);
            }}
          />
          <span>{porcentajeLote.toFixed(0)}%</span>
        </div>
      </div>

      <InputText
        label="Cantidad de lotes"
        name="cantidad"
        type="number"
        required
        min="0.01"
        step="0.01"
      />

      <div className="form-group">
        <label>Unidades totales *</label>
        <input
          min="1"
          step="1"
          value={unidadesTotales}
          onChange={(e) => setUnidadesTotales(parseInt(e.target.value) || 0)}
          className="form-control"
        />
        <small className="form-text text-muted">
          {selectedReceta && `1 lote = ${selectedReceta.cantidadUnidades} unidades`}
        </small>
      </div>
    </div>
  );
};

const ProduccionForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = getUser();
  const puntoVentaId = currentUser?.sucursal[0]?.id || null;
  
  const [insumosSeleccionados, setInsumosSeleccionados] = useState({});
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [modoMezcla, setModoMezcla] = useState(false);
  const [insumosAMezclar, setInsumosAMezclar] = useState([]);
  const [porcentajeLote, setPorcentajeLote] = useState(100);

  const {
    data: recetasPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingRecetas,
  } = useInfiniteQuery({
    queryKey: ["recetas", searchTerm],
    queryFn: ({ pageParam = 0 }) =>
      getRecetasByPage({
        page: pageParam,
        size: 10,
        nombre: searchTerm,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const allRecetas = recetasPages?.pages?.flatMap((page) =>
    page.data?.content?.map((receta) => ({
      ...receta,
      producto: {
        ...receta.producto,
        nombre: receta.nombreProducto || `Producto ${receta.productoId}`,
      },
    }))
  ) || [];

  const validationSchema = Yup.object().shape({
    recetaId: Yup.string().required("La receta es obligatoria"),
    cantidad: Yup.number()
      .min(0.1, "Mínimo 0.1 lote")
      .required("La cantidad es obligatoria"),
    observaciones: Yup.string(),
  });

  const initialValues = {
    recetaId: "",
    cantidad: 1,
    observaciones: "",
  };

  const handleInsumoSelection = (insumoId, opciones) => {
    setInsumosSeleccionados((prev) => ({
      ...prev,
      [insumoId]: opciones,
    }));
  };

  const toggleMezclaInsumo = (insumoId) => {
    setInsumosAMezclar(prev => {
      if (prev.includes(insumoId)) {
        return prev.filter(id => id !== insumoId);
      } else {
        return [...prev, insumoId];
      }
    });
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (!selectedReceta) {
        toast.error("No se ha seleccionado una receta válida");
        return;
      }

      // Validar cantidades de insumos
      let hasErrors = false;
      const porcentajesInsumos = [];

      selectedReceta.insumosGenericos?.forEach((insumo) => {
        const selections = insumosSeleccionados[insumo.id] || [];
        const totalSeleccionado = selections.reduce(
          (sum, item) => sum + (item.cantidadUsada || 0),
          0
        );
        const totalRequerido = insumo.cantidad * values.cantidad;

        if (Math.abs(totalSeleccionado - totalRequerido) > 0.01) {
          toast.error(
            `La cantidad total para ${insumo.nombre} debe ser ${totalRequerido.toFixed(2)} ${insumo.unidadMedida}. Actual: ${totalSeleccionado.toFixed(2)}`
          );
          hasErrors = true;
        }

        // Preparar porcentajes solo para insumos marcados para mezclar
        if (modoMezcla && insumosAMezclar.includes(insumo.id) && selections.length > 0) {
          const totalInsumo = selections.reduce((sum, opcion) => sum + opcion.cantidadUsada, 0);
          selections.forEach(opcion => {
            const porcentaje = (opcion.cantidadUsada / totalInsumo) * 100;
            porcentajesInsumos.push({
              insumoGenericoId: insumo.id,
              insumoId: opcion.id,
              porcentaje: parseFloat(porcentaje.toFixed(2)),
              cantidadUsada: opcion.cantidadUsada
            });
          });
        }
      });

      if (hasErrors) {
        setSubmitting(false);
        return;
      }

      const produccionData = {
        recetaId: Number(values.recetaId),
        cantidad: values.cantidad,
        sucursalId: puntoVentaId,
        observaciones: values.observaciones,
        ...(modoMezcla && { porcentajesInsumos })
      };
console.log("Producción Data:", produccionData);
      const response = await createProduccion(produccionData);
      toast.success(response?.data || "Producción registrada correctamente");

      resetForm();
      setInsumosSeleccionados({});
      setSelectedReceta(null);
      setInsumosAMezclar([]);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data || err?.message || "Error al registrar producción");
    } finally {
      setSubmitting(false);
    }
  };

  // Inicializar insumos cuando se selecciona una receta
  useEffect(() => {
    if (selectedReceta) {
      const nuevasSelecciones = {};
      selectedReceta.insumosGenericos?.forEach((insumo) => {
        if (insumo.opcionesEspecificas?.length > 0) {
          const opcionesOrdenadas = [...insumo.opcionesEspecificas].sort(
            (a, b) => a.prioridad - b.prioridad
          );

          if (opcionesOrdenadas.length > 0) {
            nuevasSelecciones[insumo.id] = [{
              ...opcionesOrdenadas[0],
              cantidadUsada: insumo.cantidad,
              uniqueKey: `${insumo.id}-${opcionesOrdenadas[0].id}-${Date.now()}`
            }];
          }
        }
      });

      setInsumosSeleccionados(nuevasSelecciones);
      setInsumosAMezclar([]);
    }
  }, [selectedReceta]);

  return (
    <div className="produccion-container">
      <Toaster richColors position="top-right" />
      <h2 className="produccion-title">Registro de Producción</h2>
      <div className="punto-venta-info">
        <strong>Punto de venta:</strong>{" "}
        {currentUser?.puntosVenta[0]?.nombre || "No asignado"}
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="produccion-form">
            <div className="form-group">
              <label>Receta *</label>
              <SelectorRecetasPaginado
                recetas={allRecetas}
                value={values.recetaId}
                onChange={(receta) => {
                  setSelectedReceta(receta);
                  setFieldValue("recetaId", receta.id); // 🔹 Esto actualiza Formik
                }}
                onLoadMore={() => fetchNextPage()}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoadingRecetas}
                onSearch={setSearchTerm}
              />
            </div>

            {selectedReceta && (
              <>
                <div className="receta-details">
                  <h4>Detalles de la Receta:</h4>
                  <p><strong>Producto final:</strong> {selectedReceta.producto?.nombre}</p>
                  <p><strong>Unidades por lote:</strong> {selectedReceta.cantidadUnidades}</p>

                  <UnidadesLotesSync 
                    selectedReceta={selectedReceta} 
                    porcentajeLote={porcentajeLote}
                    setPorcentajeLote={setPorcentajeLote}
                  />

                  <div className="modo-mezcla-control">
                    <ToggleSwitch
                      label="Habilitar mezcla de insumos"
                      checked={modoMezcla}
                      onChange={() => setModoMezcla(!modoMezcla)}
                    />
                    <span className="modo-mezcla-descripcion">
                      {modoMezcla
                        ? "Puedes seleccionar qué insumos mezclar"
                        : "Todos los insumos usarán la opción principal"}
                    </span>
                  </div>
                </div>

                <div className="insumos-section">
                  <h4>Insumos requeridos:</h4>
                  {selectedReceta.insumosGenericos?.map((insumo) => (
                    <div key={`insumo-container-${insumo.id}`} className="insumo-container">
                      {modoMezcla && (
                        <div className="mezcla-control">
                          <label>
                            <input
                              type="checkbox"
                              checked={insumosAMezclar.includes(insumo.id)}
                              onChange={() => toggleMezclaInsumo(insumo.id)}
                            />
                            Mezclar este insumo
                          </label>
                        </div>
                      )}

                      <InsumoSelector
                        insumo={insumo}
                        onSelectionChange={handleInsumoSelection}
                        seleccionesIniciales={insumosSeleccionados[insumo.id] || []}
                        modoMezcla={modoMezcla && insumosAMezclar.includes(insumo.id)}
                        editable={modoMezcla && insumosAMezclar.includes(insumo.id)}
                        porcentajeLote={porcentajeLote} // <-- Añade esta línea
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <TextArea
              name="observaciones"
              label="Observaciones"
              placeholder="Ej: Producción estándar, mezcla especial, etc."
            />

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Producción"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProduccionForm;