import Table from "../table/Table";
import './FacturaDetalle.css';

export default function FacturaDetalles({
  items,
  subtotal,
  descuentos,
  total,
  codigoMoneda,
  tipoCambio,
  monedas
}) {
  const columns = [
    {
      header: "Producto",
      accessor: "item",
    },
    {
      header: "Cantidad",
      accessor: "cantidad",
    },
    {
      header: "Precio Unitario",
      accessor: "precioUnitario",
      render: (row) => `Bs ${(row.precioUnitario || 0).toFixed(2)}`,
    },
    {
      header: "Descuento",
      accessor: "descuento",
      render: (row) => `Bs ${(row.descuento || 0).toFixed(2)}`,
    },
    {
      header: "Subtotal",
      accessor: "subtotal",
      render: (row) =>
        `Bs ${((row.precioUnitario || 0) * (row.cantidad || 0) - (row.descuento || 0)).toFixed(2)}`,
    },
  ];

  const monedaSeleccionada = monedas.find(m => m.codigoClasificador == codigoMoneda) ||
    { descripcion: "BOLIVIANO" };

  // Función para formatear valores en la moneda seleccionada
  const formatearMoneda = (valor, mostrarSimbolo = true) => {
    const valorConvertido = valor * tipoCambio;
    const simbolo = mostrarSimbolo ?
      (codigoMoneda == 46 ? "US$ " :
        codigoMoneda == 23 ? "R$ " :
          codigoMoneda == 9 ? "$ " :
            codigoMoneda == 33 ? "CLP$ " :
              codigoMoneda == 108 ? "₲ " :
                codigoMoneda == 109 ? "S/ " :
                  codigoMoneda == 149 ? "Bs.S " : "Bs ") : "";

    return `${simbolo}${valorConvertido.toFixed(2)}`;
  };

  return (
    <div className="seccion-detalles">
      <h3>Detalles de la Factura</h3>
      {codigoMoneda != 1 && (
        <div className="info-conversion">
          <p>
            Tipo de cambio: 1 Bs = {formatearMoneda(1, false)} {monedaSeleccionada.descripcion}
          </p>
        </div>
      )}
      <Table
        columns={columns}
        data={items}
        loading={false}
        showColumnVisibility={false}
        pagination={null}
      />

      <div className="resumen-totales">
        <div className="total-line">
          <span>Subtotal:</span>
          <span>{formatearMoneda(subtotal)}</span>
        </div>
        <div className="total-line">
          <span>Descuentos:</span>
          <span>- {formatearMoneda(descuentos)}</span>
        </div>
        <div className="total-line total-final">
          <span>Total:</span>
          <span>{formatearMoneda(total)}</span>
        </div>

        {/* Mostrar equivalente en Bolivianos */}
        {codigoMoneda != 1 && (
          <div className="total-line equivalente">
            <span>Equivalente en Bolivianos:</span>
            <span>Bs {total.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
