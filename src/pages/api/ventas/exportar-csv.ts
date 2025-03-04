import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { ventas } from '../../../db/schema/ventas';

export const get: APIRoute = async () => {
  try {
    const ventasData = await db.query.ventas.findMany({
      orderBy: (ventas, { desc }) => [desc(ventas.fecha)],
      with: {
        cliente: true,
        items: {
          with: {
            producto: true
          }
        }
      }
    });

    const BOM = '\uFEFF';
    const headers = [
      'Nº Venta',
      'Fecha',
      'Cliente',
      'DNI Cliente',
      'Método Pago',
      'Subtotal',
      'IVA',
      'Descuento',
      'Total',
      'Estado',
      'Productos'
    ].join(',');

    const rows = ventasData.map(venta => [
      venta.id,
      new Date(venta.fecha * 1000).toLocaleDateString(),
      escaparCSV(venta.cliente.nombre),
      venta.cliente.dni,
      venta.metodoPago,
      venta.subtotal.toFixed(2),
      venta.iva.toFixed(2),
      venta.descuento.toFixed(2),
      venta.total.toFixed(2),
      venta.estado,
      escaparCSV(venta.items.map(item => 
        `${item.producto.nombre}(${item.cantidad})`
      ).join('; '))
    ].join(','));

    return new Response(BOM + [headers, ...rows].join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=ventas-${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Error al exportar ventas:', error);
    return new Response(JSON.stringify({ message: 'Error al exportar ventas' }), { status: 500 });
  }
};

// Función helper para escapar valores CSV
function escaparCSV(texto: string | null | undefined): string {
  if (!texto) return '';
  const str = texto.toString();
  if (/[,"\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
} 