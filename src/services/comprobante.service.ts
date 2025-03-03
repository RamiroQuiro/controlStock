import { formateoMoneda } from "../utils/formateoMoneda"
import { loader } from "../utils/loader/showLoader";
import { downloadLoader } from '../utils/loader/showDownloadLoader';

export class ComprobanteService {
  public async generarComprobanteHTML(data: any) {
    // Template HTML con estilos inline para garantizar consistencia
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .comprobante { padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .totales { margin-left: auto; width: 300px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <h2>${data.tipo === 'comprobante' ? 'Comprobante' : 'Presupuesto'}</h2>
              <p>N°: ${data.codigo}</p>
              <p>Fecha: ${new Date(data.fecha).toLocaleDateString()}</p>
              ${data.tipo === 'presupuesto' ? 
                `<p style="color: red">Válido hasta: ${new Date(data.expira_at).toLocaleDateString()}</p>` 
                : ''
              }
            </div>
            
            ${data.cliente ? `
              <div style="margin: 20px 0">
                <h2>Cliente</h2>
                <p>${data.cliente.nombre}</p>
                <p>${data.cliente.documento}</p>
                ${data.cliente.direccion ? `<p>${data.cliente.direccion}</p>` : ''}
              </div>
            ` : ''}

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: right">Cant.</th>
                  <th style="text-align: right">Precio</th>
                  <th style="text-align: right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td>${item.descripcion}</td>
                    <td style="text-align: right">${item.cantidad}</td>
                    <td style="text-align: right">$${item.precioUnitario}</td>
                    <td style="text-align: right">$${item.subtotal}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totales">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                <span>Subtotal:</span>
                <span>${formateoMoneda.format(data.subtotal)}</span>
              </div>
              ${data.descuentos > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: red">
                  <span>Descuentos:</span>
                  <span>-${formateoMoneda.format(data.descuentos)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                <span>IVA:</span>
                <span>${formateoMoneda.format(data.impuestos)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #000; font-weight: bold">
                <span>Total:</span>
                <span>${formateoMoneda.format(data.total)}</span>
              </div>
            </div>
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