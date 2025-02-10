import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (xmlData) => {
  // Parse XML string to DOM
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, "text/xml");
  
  // Extract data from XML
  const cabecera = xmlDoc.getElementsByTagName('cabecera')[0];
  const detalle = xmlDoc.getElementsByTagName('detalle')[0];
  
  // Create PDF document with custom size (80mm width typical for receipt rolls)
  // Converting mm to points (1 mm = 2.83465 points)
  const pageWidth = 80 * 2.83465;
  const doc = new jsPDF({
    unit: 'pt',
    format: [pageWidth, 800] // Height will adjust automatically
  });
  
  // Set initial position
  let yPos = 20;
  const xMargin = 20;
  const lineHeight = 15;
  
  // Center text helper
  const centerText = (text, y) => {
    doc.text(text, pageWidth / 2, y, { align: 'center' });
  };
  
  // Add line helper
  const addLine = (y) => {
    doc.setLineWidth(0.5);
    doc.line(xMargin, y, pageWidth - xMargin, y);
  };
  
  // Header
  doc.setFontSize(12);
  centerText('FACTURA', yPos);
  yPos += lineHeight;
  doc.setFontSize(9);
  centerText('CON DERECHO A CRÉDITO FISCAL', yPos);
  yPos += lineHeight;
  
  // Business details
  centerText(getXMLValue(cabecera, 'razonSocialEmisor'), yPos);
  yPos += lineHeight;
  centerText('Casa Matriz', yPos);
  yPos += lineHeight;
  centerText(`No. Punto de Venta ${getXMLValue(cabecera, 'codigoPuntoVenta')}`, yPos);
  yPos += lineHeight;
  centerText(getXMLValue(cabecera, 'municipio'), yPos);
  yPos += lineHeight;
  centerText(`Tel. ${getXMLValue(cabecera, 'telefono')}`, yPos);
  yPos += lineHeight;
  
  // Add first separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Invoice details
  doc.text(`NIT: ${getXMLValue(cabecera, 'nitEmisor')}`, xMargin, yPos);
  yPos += lineHeight;
  doc.text(`FACTURA N°: ${getXMLValue(cabecera, 'numeroFactura')}`, xMargin, yPos);
  yPos += lineHeight;
  doc.text(`CÓD. AUTORIZACIÓN:`, xMargin, yPos);
  yPos += lineHeight;
  doc.text(getXMLValue(cabecera, 'cuf'), xMargin, yPos, { maxWidth: pageWidth - (2 * xMargin) });
  yPos += lineHeight * 1.5;
  
  // Add second separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Customer details
  doc.text(`NOMBRE/RAZÓN SOCIAL: ${getXMLValue(cabecera, 'nombreRazonSocial')}`, xMargin, yPos);
  yPos += lineHeight;
  doc.text(`NIT/CI/CEX: ${getXMLValue(cabecera, 'numeroDocumento')}`, xMargin, yPos);
  yPos += lineHeight;
  doc.text(`CÓD. CLIENTE: ${getXMLValue(cabecera, 'codigoCliente')}`, xMargin, yPos);
  yPos += lineHeight;
  doc.text(`FECHA DE EMISIÓN: ${formatDate(getXMLValue(cabecera, 'fechaEmision'))}`, xMargin, yPos);
  yPos += lineHeight * 1.5;
  
  // Add third separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Details header
  centerText('DETALLE', yPos);
  yPos += lineHeight;
  
  // Product details
  const descripcion = getXMLValue(detalle, 'descripcion');
  const cantidad = getXMLValue(detalle, 'cantidad');
  const precioUnitario = getXMLValue(detalle, 'precioUnitario');
  const subTotal = getXMLValue(detalle, 'subTotal');
  
  doc.text(descripcion, xMargin, yPos, { maxWidth: pageWidth - (2 * xMargin) });
  yPos += lineHeight * 2;
  doc.text(`${cantidad} X ${formatCurrency(precioUnitario)}`, xMargin, yPos);
  doc.text(formatCurrency(subTotal), pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight * 1.5;
  
  // Totals
  addLine(yPos);
  yPos += lineHeight;
  
  doc.text('DESCUENTO Bs', xMargin, yPos);
  doc.text(formatCurrency(getXMLValue(cabecera, 'descuentoAdicional')), pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  doc.text('TOTAL Bs', xMargin, yPos);
  doc.text(formatCurrency(getXMLValue(cabecera, 'montoTotal')), pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  doc.text('MONTO GIFT CARD Bs', xMargin, yPos);
  doc.text('0.00', pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  doc.text('MONTO A PAGAR Bs', xMargin, yPos);
  doc.text(formatCurrency(getXMLValue(cabecera, 'montoTotal')), pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  // Add amount in words
  yPos += lineHeight;
  addLine(yPos);
  yPos += lineHeight;
  doc.text(`Son: ${numberToWords(parseFloat(getXMLValue(cabecera, 'montoTotal')))} Bolivianos`, xMargin, yPos, { maxWidth: pageWidth - (2 * xMargin) });
  yPos += lineHeight;
  
  // Add footer text
  addLine(yPos);
  yPos += lineHeight;
  
  doc.setFontSize(8);
  const leyenda = getXMLValue(cabecera, 'leyenda');
  doc.text(leyenda, xMargin, yPos, { maxWidth: pageWidth - (2 * xMargin) });
  yPos += lineHeight * 2;
  
  doc.text('ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS.', xMargin, yPos, { maxWidth: pageWidth - (2 * xMargin) });
  yPos += lineHeight;
  doc.text('EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY', xMargin, yPos, { maxWidth: pageWidth - (2 * xMargin) });
  
  // Space for QR code (to be added later)
  yPos += lineHeight * 4;
  
  // Trim PDF to actual content height
  const finalHeight = yPos + 40; // Add some padding at the bottom
  doc.internal.pageSize.height = finalHeight;
  
  return doc;
};

// Helper functions
const getXMLValue = (element, tagName) => {
  const node = element.getElementsByTagName(tagName)[0];
  return node ? node.textContent : '';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
};

const formatCurrency = (amount) => {
  return parseFloat(amount).toFixed(2);
};

const numberToWords = (number) => {
  // You can implement or import a number-to-words converter here
  // For now, returning a simple version
  return new Intl.NumberFormat('es-BO').format(number);
};