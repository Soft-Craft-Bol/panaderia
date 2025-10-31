import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { registerMerma } from "../../service/api";
import InputText from "../../components/inputs/InputText";
import TextArea from "../../components/inputs/TextArea";
import SelectPrimary from "../../components/selected/SelectPrimary";
import { Button } from "../../components/buttons/Button";
import { toast } from "sonner";
import { getUser } from "../../utils/authFunctions";
import SelectorInsumosPaginado from "../../components/selected/SelectorInsumosPaginado";
import SelectorProductosPaginado from "../../components/selected/SelectorProductosPaginado";
import { useInsumos } from "../../hooks/useInsumos";
import { useProductos } from "../../hooks/useProductos";

const MermaForm = ({ onClose }) => {
  const currentUser = getUser();
  const puntoVentaId = currentUser?.puntosVenta[0]?.id;
  const sucursalId = currentUser?.sucursal[0]?.id;
  const registradoPor = currentUser?.username;

  const [selectedItem, setSelectedItem] = useState(null);
  
  // Estados para filtros de búsqueda
  const [filtroInsumoNombre, setFiltroInsumoNombre] = useState('');
  const [filtroProductoNombre, setFiltroProductoNombre] = useState('');

  const {
    data: insumos = [],
    fetchNextPage: fetchNextInsumos,
    hasNextPage: hasNextInsumos,
    isFetchingNextPage: isFetchingNextInsumos,
    isLoading: isLoadingInsumos,
    refetch: refetchInsumos,
  } = useInsumos({ 
    sucursalId: puntoVentaId,
    nombre: filtroInsumoNombre  // Usar el filtro local
  });

  const {
    productos,
    loadMore: loadMoreProductos,
    hasNextPage: hasNextProductos,
    isFetching: isFetchingProductos,
  } = useProductos(puntoVentaId, filtroProductoNombre); // Pasar el filtro si el hook lo soporta

  const validationSchema = Yup.object().shape({
    cantidad: Yup.number()
      .moreThan(0, "Debe ser mayor a 0")
      .required("Cantidad obligatoria"),
    motivo: Yup.string().required("Motivo obligatorio"),
    productoTipo: Yup.string()
      .oneOf(["insumo", "item"])
      .required("Tipo obligatorio"),
    productoId: Yup.string().required("Selecciona un insumo o producto"),
    tipo: Yup.string()
      .oneOf(["MERMA", "DONACION"])
      .required("Tipo obligatorio"),
  });

  const initialValues = {
    sucursalId: sucursalId || "",
    registradoPor: registradoPor || "",
    productoTipo: "item",
    productoId: "",
    cantidad: 1,
    motivo: "",
    tipo: "MERMA",
  };

  // Funciones para manejar la búsqueda
  const handleSearchInsumos = (searchTerm) => {
    setFiltroInsumoNombre(searchTerm);
  };

  const handleSearchProductos = (searchTerm) => {
    setFiltroProductoNombre(searchTerm);
  };

  // Función para manejar la selección de insumos
  const handleInsumoSelect = (insumo) => {
    setSelectedItem(insumo);
  };

  // Función para manejar la selección de productos
  const handleProductoSelect = (producto) => {
    setSelectedItem(producto);
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const dto = {
        sucursalId: sucursalId || "",
        insumoId: values.productoTipo === "insumo" ? selectedItem?.id : null,
        itemId: values.productoTipo === "item" ? selectedItem?.id : null,
        cantidad: values.cantidad,
        motivo: values.motivo,
        registradoPor: values.registradoPor,
        tipo: values.tipo,
      };

      if (!dto.insumoId && !dto.itemId) {
        toast.error("Debe seleccionar un producto o insumo válido");
        return;
      }

      const response = await registerMerma(dto);
      toast.success(response.data || `${values.tipo} registrada correctamente`);
      resetForm();
      setSelectedItem(null);
      // Resetear filtros de búsqueda
      setFiltroInsumoNombre('');
      setFiltroProductoNombre('');
      if (onClose) onClose();
    } catch (err) {
      toast.error(err?.response?.data || "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 style={{ color: "var(--primary-color)" }}>
        Registro de Merma / Donación
      </h3>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <SelectPrimary name="tipo" label="Tipo de Movimiento" required>
              <option value="MERMA">Merma</option>
              <option value="DONACION">Donación</option>
            </SelectPrimary>

            <SelectPrimary
              name="productoTipo"
              label="Tipo de Stock"
              required
              onChange={(e) => {
                setFieldValue("productoTipo", e.target.value);
                setFieldValue("productoId", "");
                setSelectedItem(null);
                // Resetear filtros cuando cambia el tipo
                setFiltroInsumoNombre('');
                setFiltroProductoNombre('');
              }}
            >
              <option value="item">Producto Terminado</option>
              <option value="insumo">Insumo</option>
            </SelectPrimary>

            {values.productoTipo === "item" ? (
              <SelectorProductosPaginado
                productos={productos}
                value={selectedItem?.id}
                onChange={(item) => {
                  handleProductoSelect(item);
                  setFieldValue("productoId", item?.id || "");
                }}
                onLoadMore={loadMoreProductos}
                hasNextPage={hasNextProductos}
                isFetchingNextPage={isFetchingProductos}
                isLoading={false}
                placeholder="Seleccionar producto terminado..."
                onSearch={handleSearchProductos}
              />
            ) : (
              <SelectorInsumosPaginado
                insumos={insumos}
                value={selectedItem?.id}
                onChange={(item) => {
                  handleInsumoSelect(item);
                  setFieldValue("productoId", item?.id || "");
                }}
                onLoadMore={fetchNextInsumos}
                hasNextPage={hasNextInsumos}
                isFetchingNextPage={isFetchingNextInsumos}
                isLoading={isLoadingInsumos}
                placeholder="Seleccionar insumo..."
                onSearch={handleSearchInsumos}
              />
            )}

            <InputText
              name="cantidad"
              label="Cantidad"
              type="number"
              step="any" 
              min="0.1"
              required
            />

            <TextArea name="motivo" label="Motivo" required />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-general"
            >
              {isSubmitting ? "Guardando…" : `Registrar`}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MermaForm;