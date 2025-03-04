import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { productos } from '../../../db/schema/productos';

export const get: APIRoute = async () => {
  try {
    const productosData = await db.query.productos.findMany({
      orderBy: (productos, { desc }) => [desc(productos.createdAt)]
    });

    const BOM = '\uFEFF';
    const headers = [
      'Código',
      'Nombre',
      'Descripción',
      'Categoría',
      'Precio Compra',
      'Precio Venta',
      'Stock Actual',
      'Stock Mínimo',
      'Proveedor',
      'Estado',
      'Última Actualización'
    ].join(',');

    const rows = productosData.map(producto => [
      escaparCSV(producto.codigo),
      escaparCSV(producto.nombre),
      escaparCSV(producto.descripcion),
      escaparCSV(producto.categoria),
      producto.precioCompra.toFixed(2),
      producto.precioVenta.toFixed(2),
      producto.stockActual,
      producto.stockMinimo,
      escaparCSV(producto.proveedor),
      producto.estado,
      new Date(producto.updatedAt * 1000).toLocaleDateString()
    ].join(','));

    return new Response(BOM + [headers, ...rows].join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=productos-${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Error al exportar productos:', error);
    return new Response(JSON.stringify({ message: 'Error al exportar productos' }), { status: 500 });
  }
}; 