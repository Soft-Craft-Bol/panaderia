import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { imageToBase64 } from '../utils/imageToBase64';
import logoHeader from '../assets/img/inpased.png';
import backgroundImage from '../assets/img/canasta.png';
import footerImage from '../assets/img/logo.webp';

export const generateCierreCajaPDF = async (data, element = null) => {
    const doc = new jsPDF();

    // Convertir imágenes a base64
    const [LOGO_HEADER, BACKGROUND_IMAGE, FOOTER_IMAGE] = await Promise.all([
        imageToBase64(logoHeader),
        imageToBase64(backgroundImage),
        imageToBase64(footerImage)
    ]);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const lineHeight = 7;
    let yPos = 28;

    // Función para hacer imagen clara y transparente
    async function makeImageTransparentAndLight(imgUrl, opacity = 0.08, whiteness = 1) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // Fondo blanco
                ctx.fillStyle = `rgba(255,255,255,${whiteness})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Imagen con opacidad
                ctx.globalAlpha = opacity;
                ctx.drawImage(img, 0, 0);

                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imgUrl;
        });
    }

    // Procesar imagen de fondo
    const processedImage = await makeImageTransparentAndLight(BACKGROUND_IMAGE, 0.08, 1);
    doc.addImage(processedImage, 'PNG', 0, 0, pageWidth, pageHeight);

    // Encabezado
    if (LOGO_HEADER) {
        doc.addImage(LOGO_HEADER, 'PNG', margin, 10, 30, 15);
    }

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(`CIERRE DE CAJA - ${data.caja}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12; // un poco más de espacio después del título

    // Fecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha: ${data.fecha}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    // Usuario
    doc.text(`Usuario: ${data.usuario}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Información básica
    doc.setFontSize(11);
    doc.setTextColor(40);

    const infoData = [
        { label: 'Monto Inicial', value: `Bs. ${data.montoInicial}` },
        { label: 'Total Ventas', value: `Bs. ${data.totalVentas}` },
        { label: 'Total Contado', value: `Bs. ${data.totalContado}` },
        { label: 'Diferencia', value: `Bs. ${data.diferencia}` }
    ];

    const colWidth = (pageWidth - 2 * margin) / 3;
    let col = 0;

    infoData.forEach((item, index) => {
        const x = margin + (col * colWidth);
        doc.text(`${item.label}:`, x, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, x + 40, yPos);
        doc.setFont('helvetica', 'normal');

        if (index % 3 === 2 || index === infoData.length - 1) {
            yPos += lineHeight;
            col = 0;
        } else {
            col++;
        }
    });

    yPos += 10;

    // Filtrar métodos de pago > 0
    const filterNonZeroMethods = (paymentMethods) => {
        return Object.entries(paymentMethods || {})
            .filter(([key, value]) => key !== 'subtotal' && parseFloat(value || 0) > 0)
            .map(([key, value]) => [key.toUpperCase(), `Bs. ${parseFloat(value || 0).toFixed(2)}`]);
    };

    // Crear tabla estilizada
    const createStyledTable = (title, tableData, total) => {
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPos);
        yPos += 7;

        doc.autoTable({
            startY: yPos,
            head: [['Método de Pago', 'Monto']],
            body: tableData,
            foot: [['TOTAL', `Bs. ${total}`]],
            theme: 'grid',
            headStyles: { fillColor: [247, 152, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { fillColor: [255, 255, 255], textColor: [40, 40, 40], cellPadding: 4 },
            footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 3, overflow: 'linebreak' },
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            columnStyles: {
                0: { cellWidth: 'auto', fontStyle: 'bold' },
                1: { cellWidth: 'auto', halign: 'right' }
            }
        });

        yPos = doc.lastAutoTable.finalY + 10;
    };

    // Tablas de pagos
    const facturaData = filterNonZeroMethods(data.resumenPagos.facturacion);
    if (facturaData.length > 0) {
        createStyledTable('VENTAS CON FACTURA', facturaData, data.resumenPagos.facturacion.subtotal?.toFixed(2) || '0.00');
    }

    const sinFacturaData = filterNonZeroMethods(data.resumenPagos.sin_facturacion);
    if (sinFacturaData.length > 0) {
        createStyledTable('VENTAS SIN FACTURA', sinFacturaData, data.resumenPagos.sin_facturacion.subtotal?.toFixed(2) || '0.00');
    }

    // Resumen de productos vendidos
    if (data.resumenProductos) {
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN DE PRODUCTOS VENDIDOS', margin, yPos);
        yPos += 7;

        // Preparar datos para la tabla de productos
        const productosData = data.resumenProductos.detallesProductos.map(prod => [
            prod.descripcionProducto,
            prod.totalCantidad.toString(),
            `Bs. ${parseFloat(prod.totalVenta || 0).toFixed(2)}`
        ]);

        // Ordenar productos por cantidad vendida (descendente)
        productosData.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));

        doc.autoTable({
            startY: yPos,
            head: [['Producto', 'Cantidad', 'Total Venta']],
            body: productosData,
            foot: [
                ['TOTAL PRODUCTOS VENDIDOS', data.resumenProductos.totalProductosVendidos.toString(), ''],
                ['TOTAL VENTAS PRODUCTOS', '', `Bs. ${parseFloat(data.resumenProductos.totalVentas || 0).toFixed(2)}`]
            ],
            theme: 'grid',
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            bodyStyles: {
                fillColor: [255, 255, 255],
                textColor: [40, 40, 40],
                cellPadding: 3
            },
            footStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                overflow: 'linebreak',
                lineWidth: 0.1
            },
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            columnStyles: {
                0: { cellWidth: 'auto', fontStyle: 'bold' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' }
            },
            didDrawPage: function (data) {
                // Agregar número de página
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(
                    `Página ${data.pageNumber} de ${data.pageCount}`,
                    pageWidth - margin,
                    pageHeight - 10
                );
            }
        });

        yPos = doc.lastAutoTable.finalY + 10;
    }

    // Stock Inicial
    if (data.productosStockInicial) {
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text('STOCK INICIAL EN INVENTARIO', margin, yPos);
        yPos += 7;

        const stockInicialData = data.productosStockInicial.map(p => [
            p.codigo,
            p.descripcion,
            p.cantidadDisponible.toString()
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Código', 'Descripción', 'Cantidad Inicial']],
            body: stockInicialData,
            theme: 'grid',
            headStyles: { fillColor: [100, 149, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { fillColor: [255, 255, 255], textColor: [40, 40, 40], cellPadding: 3 },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: margin, right: margin },
            columnStyles: {
                0: { cellWidth: 20, halign: 'center' },
                1: { cellWidth: 'auto', fontStyle: 'bold' },
                2: { cellWidth: 25, halign: 'center' }
            }
        });

        yPos = doc.lastAutoTable.finalY + 10;
    }


    if (data.productosStock) {
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text('STOCK RESTANTE EN INVENTARIO', margin, yPos);
        yPos += 7;

        // Preparar datos para la tabla de stock
        const stockData = data.productosStock.map(producto => [
            producto.codigo,
            producto.descripcion,
            producto.cantidadDisponible.toString()
        ]);

        // Ordenar productos por cantidad disponible (descendente)
        stockData.sort((a, b) => parseInt(b[2]) - parseInt(a[2]));

        doc.autoTable({
            startY: yPos,
            head: [['Código', 'Descripción', 'Cantidad Disponible']],
            body: stockData,
            theme: 'grid',
            headStyles: {
                fillColor: [75, 192, 192],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            bodyStyles: {
                fillColor: [255, 255, 255],
                textColor: [40, 40, 40],
                cellPadding: 3
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                lineWidth: 0.1
            },
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            columnStyles: {
                0: { cellWidth: 20, halign: 'center' },
                1: { cellWidth: 'auto', fontStyle: 'bold' },
                2: { cellWidth: 25, halign: 'center' }
            }
        });

        yPos = doc.lastAutoTable.finalY + 10;
    }

    // Observaciones
    if (data.observaciones) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40);
        yPos += 5;

        const splitObs = doc.splitTextToSize(data.observaciones, pageWidth - 2 * margin);
        doc.text(splitObs, margin, yPos);
        yPos += (splitObs.length * 5) + 5;
    }

    // Pie de página
    const footerY = pageHeight - 15;

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Documento generado automáticamente - Sistema de Caja', pageWidth / 2, footerY, { align: 'center' });

    // Número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10);
    }

    // Guardar
    doc.save(`cierre_caja_${data.caja}_${data.fecha}.pdf`);
};