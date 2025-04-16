
 export type Producto = {
  id: number;
  nombre: string;
  codigoBarra: string;
  descripcion: string | null;
  categoria: string;
  marca: string | null;
  modelo: string | null;
  precioCompra: number | null;
  precioVenta: number | null;
  iva: number | null;
  stock: number;
  deposito: string | null;
  localizacion: string | null;
  alertaStock: number;
  srcPhoto:string
};

export type Stock = {
  cantidad: number;
  deposito: string | null;
  localizacion: string | null;
  alertaStock: number;
};
 
 // HTML para el PDF con manejo de valores nulos
 export function generarTemplateProductos(producto: Producto, stock: Stock) {
  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        margin: 0;
        padding: 40px;
        color: #333;
      }

      .container {
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #e0e0e0;
        margin-bottom: 25px;
        padding-bottom: 10px;
      }

      .header h1 {
        font-size: 24px;
        margin: 0;
      }

      .content {
        display: flex;
        gap: 30px;
      }

      .photo {
        flex: 1;
        max-width: 300px;
        min-height: 300px;
        
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }

      .photo img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .details {
        flex: 2;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: left;
      }

      th {
        background: #f3f3f3;
        font-weight: bold;
      }

      .section-title {
        margin-top: 40px;
        font-size: 18px;
        border-bottom: 2px solid #ddd;
        padding-bottom: 5px;
      }

      .warning {
        color: #c0392b;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Ficha de Producto</h1>
      </div>

      <div class="content">
        <div class="photo">
          ${
            producto.srcPhoto
              ? `<img src="http://localhost:4321/${producto.srcPhoto}" alt="Foto del producto" />`
              : `<span>Sin imagen</span>`
          }
        </div>
        <div class="details">
          <table>
            <tr><th>Nombre</th><td>${producto.nombre || 'N/A'}</td></tr>
            <tr><th>Código de Barras</th><td>${producto.codigoBarra || 'N/A'}</td></tr>
            <tr><th>Descripción</th><td>${producto.descripcion || 'N/A'}</td></tr>
            <tr><th>Categoría</th><td>${producto.categoria || 'N/A'}</td></tr>
            <tr><th>Marca</th><td>${producto.marca || 'N/A'}</td></tr>
            <tr><th>Modelo</th><td>${producto.modelo || 'N/A'}</td></tr>
            <tr><th>Precio Compra</th><td>${producto.precioCompra ? `$${producto.precioCompra.toFixed(2)}` : 'N/A'}</td></tr>
            <tr><th>Precio Venta</th><td>${producto.precioVenta ? `$${producto.precioVenta.toFixed(2)}` : 'N/A'}</td></tr>
            <tr><th>IVA</th><td>${producto.iva ? `${producto.iva}%` : 'N/A'}</td></tr>
          </table>
        </div>
      </div>

      <div class="section-title">Datos de Stock</div>
      <table>
        <tr><th>Stock Actual</th><td class="${stock.cantidad <= stock.alertaStock ? 'warning' : ''}">${stock.cantidad}</td></tr>
        <tr><th>Alerta Stock</th><td>${stock.alertaStock}</td></tr>
        <tr><th>Depósito</th><td>${stock.deposito || 'N/A'}</td></tr>
        <tr><th>Localización</th><td>${stock.localizacion || 'N/A'}</td></tr>
      </table>

      <!-- Opcional: Sección para historial de movimientos -->
      <!--
      <div class="section-title">Historial de Movimientos</div>
      <table>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Cantidad</th>
          <th>Motivo</th>
        </tr>
        <tr>
          <td>01/04/2025</td>
          <td>Ingreso</td>
          <td>10</td>
          <td>Stock inicial</td>
        </tr>
        ...
      </table>
      -->
    </div>
  </body>
</html>
`;
}
