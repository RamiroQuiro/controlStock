import { formateoMoneda } from '../../utils/formateoMoneda';

interface Producto {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  proveedor: string;
  estado: string;
}

export function generarTemplateProductos(productos: Producto[]) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Inventario de Productos</title>
        <style>
          /* ... estilos base ... */
          .stock-bajo { color: #dc2626; }
          .stock-normal { color: #15803d; }
          
          .categoria-tag {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            background-color: #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Inventario de Productos</h1>
          <p>Total de productos: ${productos.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Proveedor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${productos.map(producto => `
              <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>
                  <span class="categoria-tag">${producto.categoria}</span>
                </td>
                <td class="${producto.stockActual <= producto.stockMinimo ? 'stock-bajo' : 'stock-normal'}">
                  ${producto.stockActual} / ${producto.stockMinimo}
                </td>
                <td>${formateoMoneda.format(producto.precioCompra)}</td>
                <td>${formateoMoneda.format(producto.precioVenta)}</td>
                <td>${producto.proveedor}</td>
                <td>${producto.estado}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
} 