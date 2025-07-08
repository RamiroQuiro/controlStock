import { formateoMoneda } from '../utils/formateoMoneda';
import { downloadLoader } from '../utils/loader/showDownloadLoader';
import formatDate from '../utils/formatDate';
import type { ComprobanteDetalle } from '../types';
import fs from 'fs/promises';
import path from 'path';

export class ComprobanteService {
  public async generarComprobanteHTML2(data: ComprobanteDetalle) {
    const logoPath = path.resolve(`./public${data.dataEmpresa?.logo}`);
    let logoBase64 = '';
    try {
      const logoBuffer = await fs.readFile(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error reading logo file:', error);
    }
    // Determina letra de comprobante (A, B, C)
    const letra = data.comprobante.tipo || 'FC_B'; // Por defecto B si no viene
    const letraAImpirmir =
      {
        FC_A: 'A',
        FC_B: 'B',
        FC_C: 'C',
        FC_X: 'X',
        NC: 'C',
        RC: 'C',
        PRESUPUESTO: 'P',
      }[letra] || 'Comprobante';
    const tipoFactura =
      {
        FC_A: 'Factura A',
        FC_B: 'Factura B',
        FC_C: 'Factura C',
        FC_X: 'Factura X',
        NC: 'Nota de Credito',
        RC: 'Recibo',
        PRESUPUESTO: 'Presupuesto',
      }[letra] || 'Comprobante';
    const sumaTotal = data.items?.reduce(
      (acc, producto) => acc + producto.precioUnitario * producto.cantidad,
      0
    );

    const sumaSubtotal = data.items?.reduce(
      (acc, producto) =>
        acc +
        (producto.precioUnitario * producto.cantidad) /
          (1 + producto.impuesto / 100),
      0
    );
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f7; }
            .comprobante {
              background: #fff;
              border-radius: 12px;
              box-shadow: 0 2px 12px rgba(0,0,0,0.08);
              max-width: 800px;
              margin: 40px auto;
              padding: 40px 48px 32px 48px;
              color: #222;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #333;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }
            .logo-container { width: 40%; }
            .logo-container img { max-width: 150px; margin-bottom: 8px; }
            .empresa-datos { font-size: 15px; color: #444; width: 40%; }
          
            .contenedor-factura-tipo {
              width: fit-content;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
            }
            .factura-tipo {
              border: 2px solid #222;
              border-radius: 7px;
              width: 68px;
              height: 68px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.4rem;
              font-weight: bold;
              color: #222;
              background: #f5f5f5;
              margin-bottom: 6px;
            }
            .factura-info { text-align: right;width: 40%;   font-size: 15px; }
            .cliente {
              background: #f4f8fa;
              border-radius: 8px;
              padding: 14px 18px;
              margin-bottom: 24px;
            }
            .cliente h2 { margin: 0 0 5px 0; font-size: 1.1rem; color: #1a3e5c; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 18px 0 20px 0;
              font-size: 15px;
            }
            th, td {
              padding: 8px 6px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }
            th { background: #e9ecef; color: #333; }
            td { color: #222; }
            .totales {
              margin-left: auto;
              width: 320px;
              background: #f9fafb;
              border-radius: 8px;
              padding: 18px 20px 12px 20px;
              font-size: 16px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            }
            .totales-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 7px;
            }
            .totales-row.total {
              border-top: 2px solid #222;
              font-weight: bold;
              font-size: 1.2rem;
              margin-top: 10px;
              padding-top: 10px;
              color: #1a3e5c;
            }
            .info-fiscal {
              font-size: 13px;
              color: #555;
              margin-top: 28px;
              border-top: 1px dashed #bbb;
              padding-top: 10px;
            }
            .footer {
              margin-top: 28px;
              font-size: 13px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              height: 50px;
              background: #f9fafb;
              color: #555;
              margin-top: 28px;
              border-top: 1px dashed #bbb;
              padding-top: 10px;
            }
            .cae-box {
              margin-top: 12px;
              font-size: 13px;
              color: #444;
              background: #e8f5e9;
              border-radius: 6px;
              padding: 8px 12px;
              display: inline-block;
            }
            @media print {
              body { background: #fff; }
              .comprobante { box-shadow: none; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <div class="logo-container">
                <img src="${logoBase64}" alt="Logo">
                <div class="empresa-datos">
                  <strong>${data.dataEmpresa?.razonSocial || ''}</strong><br>
                  CUIT: ${data.dataEmpresa?.documento || ''}<br>
                  ${data.dataEmpresa?.direccion || ''}<br>
                  ${data.dataEmpresa?.condicionIva ? `IVA: ${data.dataEmpresa.condicionIva}` : ''}
                </div>
              </div>
              <div class="contenedor-factura-tipo">
                <div class="factura-tipo">${letraAImpirmir}</div>
                <strong>${tipoFactura}</strong><br>
              </div>
              <div class="factura-info">
                  N°: <b>${data.comprobante.numeroFormateado}</b><br>
                  Fecha: ${new Date(data.comprobante.fecha).toLocaleDateString()}<br>
                  ${
                    data.comprobante.tipo === 'PRESUPUESTO'
                      ? `<span style="color: red">Válido hasta: ${new Date(data.comprobante.expira_at).toLocaleDateString()}</span><br>`
                      : ''
                  }
                </div>
              </div>
            </div>
  
            ${
              data.cliente
                ? `
              <div class="cliente">
                <h2>Cliente</h2>
                <div><b>${data.cliente.nombre}</b></div>
                <div>CUIT/DNI: ${data.cliente.documento || '-'}</div>
                ${data.cliente.direccion ? `<div>Dirección: ${data.cliente.direccion}</div>` : ''}
                ${data.cliente.condicionIva ? `<div>IVA: ${data.cliente.condicionIva}</div>` : ''}
              </div>
            `
                : ''
            }
  
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: right">Cantidad</th>
                  <th style="text-align: right">Precio Unit.</th>
                  <th style="text-align: right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.descripcion}</td>
                    <td style="text-align: right">${item.cantidad}</td>
                    <td style="text-align: right">${formateoMoneda.format(item.precioUnitario)}</td>
                    <td style="text-align: right">${formateoMoneda.format(item.subtotal)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
  
            <div class="totales">
              <div class="totales-row">
                <span>Subtotal:</span>
                <span>${formateoMoneda.format(sumaSubtotal)}</span>
              </div>
              ${
                data.comprobante.descuento > 0
                  ? `
                <div class="totales-row" style="color: #b71c1c;">
                  <span>Descuentos:</span>
                  <span>- ${formateoMoneda.format(data.comprobante.descuento)}</span>
                </div>
              `
                  : ''
              }
              <div class="totales-row">
                <span>IVA:</span>
                <span>${formateoMoneda.format(sumaTotal - sumaSubtotal)}</span>
              </div>
              <div class="totales-row total">
                <span>Total:</span>
                <span>${formateoMoneda.format(sumaTotal)}</span>
              </div>
            </div>
  
            <div class="info-fiscal">
              ${
                data.comprobante.cae
                  ? `
                <div class="cae-box">
                  CAE: <b>${data.comprobante.cae}</b> &nbsp; | &nbsp; Vencimiento CAE: ${data.comprobante.cae_vto ? new Date(data.comprobante.cae_vto).toLocaleDateString() : '-'}
                </div>
              `
                  : ''
              }
              <div>
                <b>Comprobante autorizado por AFIP</b>.<br>
                Este comprobante fue generado electrónicamente. Consulte su validez en www.afip.gob.ar
              </div>
            </div>
          </div>
          <div class="footer">
          <p><b>Gracias por su compra</b></p>
          <span>id de transaccion:<b>${data.id}</b></span>
          </div>
        </body>
      </html>
    `;
  }

  public async generarTicketHTML(data: {
    id: string;
    fecha: string;
    codigo: string;
    cliente: {
      nombre: string;
      dni: string;
      direccion?: string;
    };
    empresa: {
      razonSocial: string;
      direccion: string;
      documento: string;
    };
    comprobante: {
      numero: string;
      numeroFormateado: string;
      fecha: string;
      fechaEmision: string;
      clienteId: string;
      total: number;
      estado: string;
      tipo: string;
      puntoVenta: string;
      metodoPago?: string;
      nCheque?: string;
      vencimientoCheque?: string;
    };
    items: Array<{
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
      impuesto?: number;
      descripcion: string;
    }>;

    subtotal: number;
    impuestos: number;
    descuentos: number;
    total: number;
  }) {
    const { id, fecha, cliente, empresa, comprobante, items } = data;

    return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Ticket - ${empresa.razonSocial}</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 20px;
        background: #fff;
        color: #222;
        font-size: 14px;
      }
      .container {
        max-width: 400px;
        margin: 0 auto;
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 8px;
      }
      h1 {
        font-size: 20px;
        margin-bottom: 4px;
        text-align: center;
        color: #1a3e5c;
      }
      p, span {
        margin: 2px 0;
      }
      .empresa-info, .cliente-info, .comprobante-info {
        margin-bottom: 12px;
      }
      .items {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
      }
      .items th, .items td {
        border-bottom: 1px solid #ddd;
        padding: 6px 4px;
        text-align: left;
      }
      .items th {
        background: #f4f8fa;
        font-weight: 600;
      }
      .totales {
        width: 100%;
        margin-top: 10px;
        border-top: 2px solid #222;
        padding-top: 8px;
      }
      .totales tr td {
        padding: 6px 4px;
      }
      .totales tr td:first-child {
        font-weight: 600;
      }
      .totales tr.total td {
        font-size: 1.2rem;
        font-weight: bold;
        color: #1a3e5c;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${empresa.razonSocial}</h1>
      <div class="empresa-info">
        <p>Dirección: ${empresa.direccion}</p>
        <p>Documento: ${empresa.documento}</p>
      </div>
      <div class="comprobante-info">
        <p><strong>Fecha:</strong> ${formatDate(fecha)}</p>
        <p><strong>ID Venta:</strong> ${id}</p>
        <p><strong>N° Comprobante:</strong> ${comprobante.numero}</p>
      </div>
      <div class="cliente-info">
        <p><strong>Cliente:</strong> ${cliente.nombre}</p>
        <p><strong>Documento:</strong> ${cliente.dni}</p>
        ${cliente.direccion ? `<p><strong>Dirección:</strong> ${cliente.direccion}</p>` : ''}
      </div>
  
      <table class="items">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr>
              <td>${item.descripcion}</td>
              <td>${item.cantidad}</td>
              <td>${formateoMoneda.format(item.precioUnitario)}</td>
              <td>${formateoMoneda.format(item.subtotal)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
  
      <table class="totales">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align:right">${formateoMoneda.format(totales.subtotal)}</td>
        </tr>
        ${
          totales.descuentos > 0
            ? `<tr>
                <td>Descuentos:</td>
                <td style="text-align:right">-${formateoMoneda.format(totales.descuentos)}</td>
              </tr>`
            : ''
        }
        <tr>
          <td>IVA:</td>
          <td style="text-align:right">${formateoMoneda.format(totales.impuestos)}</td>
        </tr>
        <tr class="total">
          <td>Total:</td>
          <td style="text-align:right">${formateoMoneda.format(totales.total)}</td>
        </tr>
      </table>
    </div>
  </body>
  </html>
    `;
  }

  async descargarPDF(data: any) {
    downloadLoader(true);
    try {
      const response = await fetch('/api/comprobantes/generar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error generando PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-${data.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    } finally {
      downloadLoader(false);
    }
  }

  async imprimirComprobante(data: any) {
    try {
      // Similar a descargarPDF pero abriendo en nueva pestaña
      const response = await fetch('/api/comprobantes/generar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error generando PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Abrir en nueva pestaña para imprimir
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error al imprimir:', error);
      throw error;
    }
  }

  async compartirComprobante(id: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comprobante',
          text: `Comprobante #${id}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    }
  }

  public async generarComprobanteHTML(data: ComprobanteDetalle) {
    const logoPath = path.resolve(`./public${data.dataEmpresa?.logo}`);
    let logoBase64 = '';
    try {
      const logoBuffer = await fs.readFile(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error reading logo file:', error);
    }
    // Determina letra de comprobante (A, B, C)
    const letra = data.comprobante.tipo || 'FC_B'; // Por defecto B si no viene
    const letraAImpirmir =
      {
        FC_A: 'A',
        FC_B: 'B',
        FC_C: 'C',
        FC_X: 'X',
        NC: 'C',
        RC: 'C',
        PRESUPUESTO: 'P',
      }[letra] || 'Comprobante';
    const tipoFactura =
      {
        FC_A: 'Factura A',
        FC_B: 'Factura B',
        FC_C: 'Factura C',
        FC_X: 'Factura X',
        NC: 'Nota de Credito',
        RC: 'Recibo',
        PRESUPUESTO: 'Presupuesto',
      }[letra] || 'Comprobante';
    const sumaTotal = data.items?.reduce(
      (acc, producto) => acc + producto.precioUnitario * producto.cantidad,
      0
    );

    const sumaSubtotal = data.items?.reduce(
      (acc, producto) =>
        acc +
        (producto.precioUnitario * producto.cantidad) /
          (1 + producto.impuesto / 100),
      0
    );

    // New template starts here
    return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tipoFactura} - ${data.comprobante.numeroFormateado}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .shadow-custom { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            .print-full { width: 100% !important; max-width: none !important; margin: 0 !important; }
          }
        </style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        <div class="w-full mx-auto p-2 md:p-1">
          <div class="bg-white border border-gray-200 rounded-md overflow-hidden print-full">
            <div class="p-4 md:p-6">
              <!-- Header -->
              <div class="border-b-2 border-gray-800 pb-6 mb-8">
                <div class="flex  justify-between items-start gap-2">
                  <!-- Empresa -->
                  <div class="flex-1">
                    <img src="${logoBase64}" alt="Logo" class="h-16 w-auto mb-4 object-contain">
                    <div class="space-y-1 text-gray-700">
                      <h1 class="text-xl font-bold text-gray-900">${data.dataEmpresa?.razonSocial || ''}</h1>
                      <p class="text-sm">CUIT: ${data.dataEmpresa?.documento || ''}</p>
                      <p class="text-sm">${data.dataEmpresa?.direccion || ''}</p>
                      <p class="text-sm">IVA: ${data.dataEmpresa?.condicionIva || ''}</p>
                    </div>
                  </div>
                  <!-- Tipo -->
                  <div class="flex flex-col items-center">
                    <div class="w-20 h-20 rounded-xl border-4 border-gray-600 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                      <span class="text-3xl font-bold text-gray-800">${letraAImpirmir}</span>
                    </div>
                    <div class="mt-3 text-center">
                      <p class="font-semibold text-gray-800">${tipoFactura}</p>
                    </div>
                  </div>
                  <!-- Info -->
                  <div class="flex-1  text-right space-y-3">
                    <div class="bg-gray-50 p-4 w- rounded-lg">
                      <p class="text-md text-gray-600">Número</p>
                      <p class="text-sm font-bold text-gray-900">${data.comprobante.numeroFormateado}</p>
                    </div>
                    <div class="bg-gray-50 p-4 w- rounded-lg">
                      <p class="text-md text-gray-600">Fecha</p>
                      <p class="text-sm font-semibold text-gray-900">${new Date(data.comprobante.fecha).toLocaleDateString()}</p>
                       ${
                         data.comprobante.tipo === 'PRESUPUESTO'
                           ? `<span style="color: red">Válido hasta: ${new Date(data.comprobante.expira_at).toLocaleDateString()}</span><br>`
                           : ''
                       }
                    </div>
                  </div>
                </div>
              </div>
              <!-- Cliente -->
              ${
                data.cliente
                  ? `
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Datos del Cliente
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-600">Nombre / Razón Social</p>
                    <p class="font-semibold text-gray-900">${data.cliente.nombre}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">CUIT/DNI</p>
                    <p class="font-semibold text-gray-900">${data.cliente.documento || '-'}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Dirección</p>
                    <p class="font-semibold text-gray-900">${data.cliente.direccion || ''}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Condición IVA</p>
                    <p class="font-semibold text-gray-900">${data.cliente.condicionIva || ''}</p>
                  </div>
                </div>
              </div>`
                  : ''
              }
              <!-- Items -->
              <div class="mb-8">
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table class="w-full">
                    <thead>
                      <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Cantidad</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Precio Unit.</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      ${data.items
                        .map(
                          (item) => `
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 text-sm text-gray-900">${item.descripcion}</td>
                        <td class="px-6 py-4 text-right text-sm text-gray-900">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${item.cantidad}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">${formateoMoneda.format(item.precioUnitario)}</td>
                        <td class="px-6 py-4 text-right text-sm font-bold text-gray-900">${formateoMoneda.format(item.subtotal)}</td>
                      </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              <!-- Totales -->
              <div class="flex justify-end mb-8">
                <div class="w-full max-w-md">
                  <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
                    <div class="space-y-3">
                      <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-gray-600">Subtotal</span>
                        <span class="text-sm font-medium text-gray-900">${formateoMoneda.format(sumaSubtotal)}</span>
                      </div>
                      ${
                        data.comprobante.descuento > 0
                          ? `
                      <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-gray-600">Descuentos</span>
                        <span class="text-sm font-medium text-red-600">- ${formateoMoneda.format(data.comprobante.descuento)}</span>
                      </div>`
                          : ''
                      }
                      <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-gray-600">IVA</span>
                        <span class="text-sm font-medium text-gray-900">${formateoMoneda.format(sumaTotal - sumaSubtotal)}</span>
                      </div>
                      <div class="border-t-2 border-gray-800 pt-3 mt-4">
                        <div class="flex justify-between items-center">
                          <span class="text-lg font-bold text-gray-900">Total</span>
                          <span class="text-xl font-bold text-gray-900">${formateoMoneda.format(sumaTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Footer -->
              <div class="space-y-6 mt-8">
                ${
                  data.comprobante.cae
                    ? `
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-3 mb-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="font-semibold text-green-800">CAE: ${data.comprobante.cae}</span>
                  </div>
                  <p class="text-sm text-green-700">
                    Vencimiento: ${data.comprobante.cae_vto ? new Date(data.comprobante.cae_vto).toLocaleDateString() : '-'}
                  </p>
                </div>`
                    : ''
                }
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-700">
                    <strong>Comprobante autorizado por AFIP.</strong><br>
                    Este comprobante fue generado electrónicamente. Consulte su validez en www.afip.gob.ar
                  </p>
                </div>
                <div class="gradient-bg text-white rounded-lg p-6">
                  <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="text-center md:text-left">
                      <p class="text-lg font-semibold mb-1">¡Gracias por su compra!</p>
                      <p class="text-blue-100 text-sm">Esperamos verle pronto nuevamente</p>
                    </div>
                    <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                      <span class="text-sm">ID: <strong>${data.id}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;
  }
}
