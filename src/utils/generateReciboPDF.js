import { jsPDF } from "jspdf";
import 'jspdf-autotable';

export const generateReciboPDF = (ventaData) => {
  const pageWidth = 80 * 2.83465; 
  const doc = new jsPDF({
    unit: 'pt',
    format: [pageWidth, 800] 
  });

  let yPos = 80; 
  const xMargin = 15;
  const lineHeight = 14;
  const contentWidth = pageWidth - (2 * xMargin);

  const centerText = (text, y) => {
    doc.text(text, pageWidth / 2, y, { align: 'center' });
  };

  const addLine = (y) => {
    doc.setLineWidth(0.5);
    const dashLength = 5; 
    const gapLength = 3;  
    let x = xMargin;

    while (x < pageWidth - xMargin) {
      doc.line(x, y, x + dashLength, y); 
      x += dashLength + gapLength;       
    }
  };


  doc.setFontSize(18);
  centerText('RECIBO DE VENTA', yPos);
  yPos += lineHeight;

  doc.setFontSize(12);
  centerText(ventaData.puntoVenta.sucursal.empresa.razonSocial, yPos);
  yPos += lineHeight;
  centerText(`Sucursal: ${ventaData.puntoVenta.sucursal.nombre}`, yPos);
  yPos += lineHeight;
  centerText(`Dirección: ${ventaData.puntoVenta.sucursal.direccion}`, yPos);
  yPos += lineHeight;
  centerText(`Teléfono: ${ventaData.puntoVenta.sucursal.telefono}`, yPos);
  yPos += lineHeight;

  addLine(yPos);
  yPos += lineHeight;

  doc.setFontSize(12);
  centerText(`Cliente: ${ventaData.cliente}`, yPos);
  yPos += lineHeight;
  centerText(`Fecha: ${new Date(ventaData.fecha).toLocaleDateString()}`, yPos);
  yPos += lineHeight;

  centerText(`Vendedor: ${ventaData.vendedor.firstName} ${ventaData.vendedor.lastName}`, yPos);
  yPos += lineHeight;

  addLine(yPos);
  yPos += lineHeight;

  doc.setFontSize(14);
  centerText('DETALLE DE LA VENTA', yPos);
  yPos += lineHeight;

  ventaData.detalles.forEach((detalle, index) => {
    doc.setFontSize(12);
    centerText(`Producto: ${detalle.descripcionProducto}`, yPos);
    yPos += lineHeight;
    centerText(`Cantidad: ${detalle.cantidad}`, yPos);
    yPos += lineHeight;
    centerText(`Precio Unitario: ${(detalle.monto / detalle.cantidad).toFixed(2)} Bs`, yPos);
    yPos += lineHeight;
    centerText(`Descuento: ${detalle.montoDescuento.toFixed(2)} Bs`, yPos);
    yPos += lineHeight;

    addLine(yPos);
    yPos += lineHeight;
  });

  doc.setFontSize(14);
  centerText(`TOTAL: ${ventaData.monto.toFixed(2)} Bs`, yPos);
  yPos += lineHeight;

  addLine(yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  centerText('Gracias por su compra', yPos);
  yPos += lineHeight;
  centerText('Vuelva pronto', yPos);

  const fileName = `recibo_${ventaData.id}.pdf`;
  doc.save(fileName);
};