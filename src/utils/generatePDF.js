import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (xmlData) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, "text/xml");
  
  
  // Extract data from XML
  const cabecera = xmlDoc.getElementsByTagName('cabecera')[0];
  const detalle = xmlDoc.getElementsByTagName('detalle')[0];
  
  // Create PDF document with roll paper size (80mm)
  const pageWidth = 80 * 2.83465; // 80mm converted to points
  const doc = new jsPDF({
    unit: 'pt',
    format: [pageWidth, 800],
    margins: {
      top: 80,
      bottom: 40,
      left: 15,
      right: 15
    }  
  });
  
  // Configuración inicial
  let yPos = 80; // Aumentado el margen superior
  const xMargin = 15; // Reducido el margen lateral
  const lineHeight = 14; // Ajustado el espaciado entre líneas
  const contentWidth = pageWidth - (2 * xMargin);
  
  // Center text helper
  const centerText = (text, y) => {
    doc.text(text, pageWidth / 2, y, { align: 'center' });
  };
  
  // Add line helper
  const addLine = (y) => {
    doc.setLineWidth(0.5);
    doc.line(xMargin, y, pageWidth - xMargin, y);
  };

  // Wrap text helper
  const wrapText = (text, maxWidth) => {
    const words = text.split('');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const width = doc.getStringUnitWidth(currentLine + word) * doc.getFontSize();
      if (width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += word;
      }
    });
    lines.push(currentLine);
    return lines;
  };
  
  // Header section
  doc.setFontSize(11);
  centerText('FACTURA', yPos);
  yPos += lineHeight;
  doc.setFontSize(9);
  centerText('CON DERECHO A CRÉDITO FISCAL', yPos);
  yPos += lineHeight;
  centerText(getXMLValue(cabecera, 'razonSocialEmisor'), yPos);
  yPos += lineHeight;
  centerText('Casa Matriz', yPos);
  yPos += lineHeight;
  centerText(`No. Punto de Venta ${getXMLValue(cabecera, 'codigoPuntoVenta')}`, yPos);
  yPos += lineHeight;
  centerText(getXMLValue(cabecera, 'direccion'), yPos);
  yPos += lineHeight;
  centerText(`Tel. ${getXMLValue(cabecera, 'telefono')}`, yPos);
  yPos += lineHeight;
  centerText(getXMLValue(cabecera, 'municipio'), yPos);
  yPos += lineHeight;
  
  // Add separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Invoice details
  doc.text(`NIT: ${getXMLValue(cabecera, 'nitEmisor')}`, xMargin, yPos);
  yPos += lineHeight;
  doc.text(`FACTURA N°: ${getXMLValue(cabecera, 'numeroFactura')}`, xMargin, yPos);
  yPos += lineHeight;
  
  // CÓD. AUTORIZACIÓN with wrap
  doc.text('CÓD. AUTORIZACIÓN:', xMargin, yPos);
  yPos += lineHeight;
  
  const cuf = getXMLValue(cabecera, 'cuf');
  const cufLines = wrapText(cuf, contentWidth);
  cufLines.forEach(line => {
    doc.text(line, xMargin, yPos);
    yPos += lineHeight;
  });
  
  // Add separator
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
  yPos += lineHeight;
  
  // Add separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Details section
  centerText('DETALLE', yPos);
  yPos += lineHeight;
  
  // Product details with wrap
  const descripcion = getXMLValue(detalle, 'descripcion');
  const descripcionLines = doc.splitTextToSize(descripcion, contentWidth);
  descripcionLines.forEach(line => {
    doc.text(line, xMargin, yPos);
    yPos += lineHeight;
  });
  
  // Amount line
  const cantidad = getXMLValue(detalle, 'cantidad');
  const precioUnitario = getXMLValue(detalle, 'precioUnitario');
  const subTotal = getXMLValue(detalle, 'subTotal');
  
  doc.text(`${cantidad} X ${formatCurrency(precioUnitario)}`, xMargin, yPos);
  doc.text(formatCurrency(subTotal), pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  // Add separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Totals section
  const montoTotal = getXMLValue(cabecera, 'montoTotal');
  
  doc.text('DESCUENTO Bs', xMargin, yPos);
  doc.text('0.00', pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  doc.text('TOTAL Bs', xMargin, yPos);
  doc.text(formatCurrency(montoTotal), pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  doc.text('MONTO GIFT CARD Bs', xMargin, yPos);
  doc.text('0.00', pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  doc.text('MONTO A PAGAR Bs', xMargin, yPos);
  doc.text(formatCurrency(montoTotal), pageWidth - xMargin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  // Add separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Amount in words
  const wordsText = `Son: ${numberToWords(parseFloat(montoTotal))} Bolivianos`;
  const wordsLines = doc.splitTextToSize(wordsText, contentWidth);
  wordsLines.forEach(line => {
    doc.text(line, xMargin, yPos);
    yPos += lineHeight;
  });
  
  // Add separator
  addLine(yPos);
  yPos += lineHeight;
  
  // Footer text
  doc.setFontSize(8);
  doc.text('ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS,', xMargin, yPos, { maxWidth: contentWidth });
  yPos += lineHeight;
  doc.text('EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE', xMargin, yPos);
  yPos += lineHeight;
  doc.text('ACUERDO A LEY', xMargin, yPos);
  yPos += lineHeight * 1.5;
  
  const leyendaLines = doc.splitTextToSize(getXMLValue(cabecera, 'leyenda'), contentWidth);
  leyendaLines.forEach(line => {
    doc.text(line, xMargin, yPos);
    yPos += lineHeight;
  });
  
  yPos += lineHeight * 4;
  
  // Space for QR code (to be added later)
  yPos += 100;
  
  // Trim PDF to actual content height
  doc.internal.pageSize.height = yPos;
  
  return doc;
};

// Helper functions remain the same
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
  return `${new Intl.NumberFormat('es-BO').format(number)} 00/100`;
};