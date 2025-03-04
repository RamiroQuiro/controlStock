import { formateoMoneda } from '../../utils/formateoMoneda';

interface Proveedor {
  nombre: string;
  cuit: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  contacto: string | null;
  estado: string;
  ultimaCompra: number | null;
  totalComprado: number;
}

export function generarTemplateProveedores(proveedores: Proveedor[]) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Listado de Proveedores</title>
        <style>
          /* ... estilos base ... */
          .estado-activo { color: #15803d; }
          .estado-inactivo { color: #dc2626; }
          
          .total-compras {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Listado de Proveedores</h1>
          <p>Total de proveedores: ${proveedores.length}</p>
        </div>
        
        <div class="total-compras">
          <h3>Total Comprado: ${formateoMoneda.format(
            proveedores.reduce((sum, prov) => sum + prov.totalComprado, 0)
          )}</h3>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CUIT</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Última Compra</th>
              <th>Total Comprado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${proveedores.map(proveedor => `
              <tr>
                <td>${proveedor.nombre}</td>
                <td>${proveedor.cuit}</td>
                <td>${proveedor.contacto || '-'}</td>
                <td>${proveedor.telefono || '-'}</td>
                <td>${proveedor.email || '-'}</td>
                <td>${proveedor.ultimaCompra 
                  ? new Date(proveedor.ultimaCompra * 1000).toLocaleDateString() 
                  : '-'}</td>
                <td>${formateoMoneda.format(proveedor.totalComprado)}</td>
                <td class="estado-${proveedor.estado.toLowerCase()}">
                  ${proveedor.estado}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
} 