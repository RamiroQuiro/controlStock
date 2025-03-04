import { formateoMoneda } from '../../utils/formateoMoneda';

interface ItemVenta {
  producto: {
    nombre: string;
    codigo: string;
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Venta {
  id: string;
  fecha: number;
  cliente: {
    nombre: string;
    dni: string;
    direccion: string | null;
  };
  items: ItemVenta[];
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  metodoPago: string;
  estado: string;
}

export function generarTemplateVentas(ventas: Venta[]) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Ventas</title>
        <style>
          /* ... estilos base ... */
          .total-ventas {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
            text-align: right;
          }
          
          .metodo-pago {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            background-color: #e2e8f0;
            font-size: 11px;
          }
          
          .estado-completada { color: #15803d; }
          .estado-pendiente { color: #ca8a04; }
          .estado-cancelada { color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Ventas</h1>
          <p>Total de ventas: ${ventas.length}</p>
        </div>
        
        <div class="total-ventas">
          <h3>Total General: ${formateoMoneda.format(
            ventas.reduce((sum, venta) => sum + venta.total, 0)
          )}</h3>
        </div>
        
        ${ventas.map(venta => `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h3>Venta #${venta.id}</h3>
            <p>Fecha: ${new Date(venta.fecha * 1000).toLocaleDateString()}</p>
            <p>Cliente: ${venta.cliente.nombre} (${venta.cliente.dni})</p>
            
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${venta.items.map(item => `
                  <tr>
                    <td>${item.producto.nombre}</td>
                    <td>${item.cantidad}</td>
                    <td>${formateoMoneda.format(item.precioUnitario)}</td>
                    <td>${formateoMoneda.format(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 15px;">
              <p>Subtotal: ${formateoMoneda.format(venta.subtotal)}</p>
              <p>IVA: ${formateoMoneda.format(venta.iva)}</p>
              <p>Descuento: ${formateoMoneda.format(venta.descuento)}</p>
              <p style="font-weight: bold;">Total: ${formateoMoneda.format(venta.total)}</p>
            </div>
          </div>
        `).join('')}
      </body>
    </html>
  `;
} 