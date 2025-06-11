import { formateoMoneda } from "../utils/formateoMoneda"
import { loader } from "../utils/loader/showLoader";
import { downloadLoader } from '../utils/loader/showDownloadLoader';
import formatDate from "../utils/formatDate";

export class ComprobanteService {
  public async generarComprobanteHTML(data: any) {
    // Determina letra de comprobante (A, B, C)
    const letra = data.letra || 'B'; // Por defecto B si no viene
    const tipoFactura = {
      A: 'Factura A',
      B: 'Factura B',
      C: 'Factura C',
      X: 'Factura X',
      PRESUPUESTO: 'Presupuesto'
    }[letra] || 'Comprobante';
  
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
            .logo-container { flex: 1; }
            .logo-container img { max-width: 150px; margin-bottom: 8px; }
            .empresa-datos { font-size: 15px; color: #444; }
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
            .factura-info { text-align: right; font-size: 15px; }
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
                <img src="${data.empresa?.logo || ''}" alt="Logo">
                <div class="empresa-datos">
                  <strong>${data.empresa?.razonSocial || ''}</strong><br>
                  CUIT: ${data.empresa?.documento || ''}<br>
                  ${data.empresa?.direccion || ''}<br>
                  ${data.empresa?.condicionIva ? `IVA: ${data.empresa.condicionIva}` : ''}
                </div>
              </div>
              <div style="text-align: right;">
                <div class="factura-tipo">${letra}</div>
                <div class="factura-info">
                  <strong>${tipoFactura}</strong><br>
                  N°: <b>${data.codigo}</b><br>
                  Fecha: ${new Date(data.fecha).toLocaleDateString()}<br>
                  ${data.tipo === 'presupuesto' ? 
                    `<span style="color: red">Válido hasta: ${new Date(data.expira_at).toLocaleDateString()}</span><br>` 
                    : ''
                  }
                </div>
              </div>
            </div>
  
            ${data.cliente ? `
              <div class="cliente">
                <h2>Cliente</h2>
                <div><b>${data.cliente.nombre}</b></div>
                <div>CUIT/DNI: ${data.cliente.documento || '-'}</div>
                ${data.cliente.direccion ? `<div>Dirección: ${data.cliente.direccion}</div>` : ''}
                ${data.cliente.condicionIva ? `<div>IVA: ${data.cliente.condicionIva}</div>` : ''}
              </div>
            ` : ''}
  
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: right">Cantidad</th>
                  <th style="text-align: right">Precio Unit.</th>
                  <th style="text-align: right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td>${item.descripcion}</td>
                    <td style="text-align: right">${item.cantidad}</td>
                    <td style="text-align: right">${formateoMoneda.format(item.precio)}</td>
                    <td style="text-align: right">${formateoMoneda.format(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
  
            <div class="totales">
              <div class="totales-row">
                <span>Subtotal:</span>
                <span>${formateoMoneda.format(data.totales.subtotal)}</span>
              </div>
              ${data.totales.descuentos > 0 ? `
                <div class="totales-row" style="color: #b71c1c;">
                  <span>Descuentos:</span>
                  <span>- ${formateoMoneda.format(data.totales.descuentos)}</span>
                </div>
              ` : ''}
              <div class="totales-row">
                <span>IVA:</span>
                <span>${formateoMoneda.format(data.totales.impuestos)}</span>
              </div>
              <div class="totales-row total">
                <span>Total:</span>
                <span>${formateoMoneda.format(data.totales.total)}</span>
              </div>
            </div>
  
            <div class="info-fiscal">
              ${data.cae ? `
                <div class="cae-box">
                  CAE: <b>${data.cae}</b> &nbsp; | &nbsp; Vencimiento CAE: ${data.cae_vto ? new Date(data.cae_vto).toLocaleDateString() : '-'}
                </div>
              ` : ''}
              <div>
                <b>Comprobante autorizado por AFIP</b>.<br>
                Este comprobante fue generado electrónicamente. Consulte su validez en www.afip.gob.ar
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  
  public async generarTicketHTML(data: {
    id: string;
    fecha: string;
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
    totales: {
      subtotal: number;
      impuestos: number;
      descuentos: number;
      total: number;
    };
 

  }) {
    const { id, fecha, cliente, empresa, comprobante, items, totales } = data;
  
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
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error generando PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-${data.codigo}.pdf`;
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
        body: JSON.stringify(data)
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

  async compartirComprobante(codigo: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comprobante',
          text: `Comprobante #${codigo}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    }
  }
} 
