import { formateoMoneda } from '../../utils/formateoMoneda';

interface Cliente {
  nombre: string;
  dni: string;
  telefono: string | null;
  email: string | null;
  categoria: string;
  estado: string;
  limiteCredito: number;
  saldoPendiente: number;
}

export function generarTemplateClientes(clientes: Cliente[]) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Listado de Clientes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            border-bottom: 2px solid #eee;
          }
          
          .header img {
            max-width: 200px;
            margin-bottom: 10px;
          }
          
          .fecha {
            text-align: right;
            margin-bottom: 20px;
            color: #666;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .categoria {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
          }
          
          .categoria-VIP {
            background-color: #e9d5ff;
            color: #6b21a8;
          }
          
          .categoria-regular {
            background-color: #dbeafe;
            color: #1e40af;
          }
          
          .categoria-nuevo {
            background-color: #dcfce7;
            color: #15803d;
          }
          
          .estado-activo {
            color: #15803d;
          }
          
          .estado-inactivo {
            color: #dc2626;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="data:image/png;base64,TU_LOGO_EN_BASE64" alt="Logo">
          <h1>Listado de Clientes</h1>
          <p>Total de clientes: ${clientes.length}</p>
        </div>
        
        <div class="fecha">
          Fecha: ${new Date().toLocaleDateString()}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Límite Crédito</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${clientes.map(cliente => `
              <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.dni}</td>
                <td>${cliente.telefono || '-'}</td>
                <td>${cliente.email || '-'}</td>
                <td>
                  <span class="categoria categoria-${cliente.categoria.toLowerCase()}">
                    ${cliente.categoria}
                  </span>
                </td>
                <td class="estado-${cliente.estado}">
                  ${cliente.estado}
                </td>
                <td>${formateoMoneda.format(cliente.limiteCredito)}</td>
                <td>${formateoMoneda.format(cliente.saldoPendiente)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Documento generado automáticamente - ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;
} 