import { jsPDF } from "jspdf";
export const generateReciboPDF = (ventaData) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Recibo de Venta", 10, 20);
  doc.setFontSize(12);
  doc.text(`Empresa: ${ventaData.puntoVenta.sucursal.empresa.razonSocial}`, 10, 30);
  doc.text(`Sucursal: ${ventaData.puntoVenta.sucursal.nombre}`, 10, 40);
  doc.text(`Dirección: ${ventaData.puntoVenta.sucursal.direccion}`, 10, 50);
  doc.text(`Teléfono: ${ventaData.puntoVenta.sucursal.telefono}`, 10, 60);
  doc.text(`Cliente: ${ventaData.cliente}`, 10, 70);
  doc.text(`Fecha: ${new Date(ventaData.fecha).toLocaleDateString()}`, 10, 80);
  doc.text(`Vendedor: ${ventaData.vendedor.firstName} ${ventaData.vendedor.lastName}`, 10, 90);

  doc.setFontSize(14);
  doc.text("Detalles de la Venta", 10, 100);

  let yPosition = 110; 

  ventaData.detalles.forEach((detalle, index) => {
    doc.setFontSize(12);
    doc.text(`Producto: ${detalle.descripcionProducto}`, 10, yPosition);
    doc.text(`Cantidad: ${detalle.cantidad}`, 100, yPosition);
    doc.text(`Precio Unitario: ${(detalle.monto / detalle.cantidad).toFixed(2)} Bs`, 140, yPosition);
    doc.text(`Descuento: ${detalle.montoDescuento.toFixed(2)} Bs`, 180, yPosition);
    yPosition += 10;
  });
  doc.setFontSize(14);
  doc.text(`Total: ${ventaData.monto.toFixed(2)} Bs`, 10, yPosition + 10);
  const fileName = `recibo_${ventaData.id}.pdf`;
  doc.save(fileName);
};