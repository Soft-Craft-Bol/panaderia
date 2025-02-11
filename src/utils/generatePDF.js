import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

export const generatePDF = async (xmlData) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, "text/xml");

  const cabecera = xmlDoc.getElementsByTagName('cabecera')[0];
  const detalle = xmlDoc.getElementsByTagName('detalle')[0];

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
    doc.line(xMargin, y, pageWidth - xMargin, y);
  };

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

  addLine(yPos);
  yPos += lineHeight;

  centerText(`NIT: ${getXMLValue(cabecera, 'nitEmisor')}`, yPos);
  yPos += lineHeight;
  centerText(`FACTURA N°: ${getXMLValue(cabecera, 'numeroFactura')}`, yPos);
  yPos += lineHeight;

  centerText('CÓD. AUTORIZACIÓN:', yPos);
  yPos += lineHeight;
  
  const cuf = getXMLValue(cabecera, 'cuf');
  const cufLines = wrapText(cuf, contentWidth);
  cufLines.forEach(line => {
    centerText(line, yPos);
    yPos += lineHeight;
  });

  addLine(yPos);
  yPos += lineHeight;

  centerText(`NOMBRE/RAZÓN SOCIAL: ${getXMLValue(cabecera, 'nombreRazonSocial')}`, yPos);
  yPos += lineHeight;
  centerText(`NIT/CI/CEX: ${getXMLValue(cabecera, 'numeroDocumento')}`, yPos);
  yPos += lineHeight;
  centerText(`CÓD. CLIENTE: ${getXMLValue(cabecera, 'codigoCliente')}`, yPos);
  yPos += lineHeight;
  centerText(`FECHA DE EMISIÓN: ${formatDate(getXMLValue(cabecera, 'fechaEmision'))}`, yPos);
  yPos += lineHeight;

  addLine(yPos);
  yPos += lineHeight;

  centerText('DETALLE', yPos);
  yPos += lineHeight;

  const descripcion = getXMLValue(detalle, 'descripcion');
  const descripcionLines = doc.splitTextToSize(descripcion, contentWidth);
  descripcionLines.forEach(line => {
    centerText(line, yPos);
    yPos += lineHeight;
  });

  const cantidad = getXMLValue(detalle, 'cantidad');
  const precioUnitario = getXMLValue(detalle, 'precioUnitario');
  const subTotal = getXMLValue(detalle, 'subTotal');

  centerText(`${cantidad} X ${formatCurrency(precioUnitario)}`, yPos);
  centerText(formatCurrency(subTotal), yPos + lineHeight);
  yPos += lineHeight * 2;

  addLine(yPos);
  yPos += lineHeight;

  const montoTotal = getXMLValue(cabecera, 'montoTotal');

  centerText('DESCUENTO Bs 0.00', yPos);
  yPos += lineHeight;
  
  centerText(`TOTAL Bs ${formatCurrency(montoTotal)}`, yPos);
  yPos += lineHeight;

  centerText('MONTO GIFT CARD Bs 0.00', yPos);
  yPos += lineHeight;

  centerText(`MONTO A PAGAR Bs ${formatCurrency(montoTotal)}`, yPos);
  yPos += lineHeight;

  addLine(yPos);
  yPos += lineHeight;

  const wordsText = `Son: ${numberToWords(parseFloat(montoTotal))} Bolivianos`;
  const wordsLines = doc.splitTextToSize(wordsText, contentWidth);
  wordsLines.forEach(line => {
    centerText(line, yPos);
    yPos += lineHeight;
  });

  addLine(yPos);
  yPos += lineHeight;

  doc.setFontSize(8);
  centerText('ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS,', yPos);
  yPos += lineHeight;
  centerText('EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE', yPos);
  yPos += lineHeight;
  centerText('ACUERDO A LEY', yPos);
  yPos += lineHeight * 1.5;

  const leyendaLines = doc.splitTextToSize(getXMLValue(cabecera, 'leyenda'), contentWidth);
  leyendaLines.forEach(line => {
    centerText(line, yPos);
    yPos += lineHeight;
  });

  yPos += lineHeight * 4;

  const qrUrl = `https://pilotosiat.impuestos.gob.bo/consulta/QR?nit=${getXMLValue(cabecera, 'nitEmisor')}&cuf=${getXMLValue(cabecera, 'cuf')}&numero=1&t=1`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl);
  const qrSize = 100;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = yPos;
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  yPos += qrSize + 20;

  doc.internal.pageSize.height = yPos;

  return doc;
};

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