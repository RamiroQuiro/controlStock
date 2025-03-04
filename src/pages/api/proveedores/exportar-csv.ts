import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { proveedores } from '../../../db/schema/proveedores';

export const get: APIRoute = async () => {
  try {
    const proveedoresData = await db.query.proveedores.findMany({
      orderBy: (proveedores, { desc }) => [desc(proveedores.createdAt)]
    });

    const BOM = '\uFEFF';
    const headers = [
      'Nombre',
      'CUIT',
      'Teléfono',
      'Email',
      'Dirección',
      'Contacto',
      'Estado',
      'Última Compra',
      'Total Comprado',
      'Observaciones'
    ].join(',');

    const rows = proveedoresData.map(proveedor => [
      escaparCSV(proveedor.nombre),
      escaparCSV(proveedor.cuit),
      escaparCSV(proveedor.telefono),
      escaparCSV(proveedor.email),
      escaparCSV(proveedor.direccion),
      escaparCSV(proveedor.contacto),
      proveedor.estado,
      proveedor.ultimaCompra ? new Date(proveedor.ultimaCompra * 1000).toLocaleDateString() : '',
      proveedor.totalComprado.toFixed(2),
      escaparCSV(proveedor.observaciones)
    ].join(','));

    return new Response(BOM + [headers, ...rows].join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=proveedores-${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Error al exportar proveedores:', error);
    return new Response(JSON.stringify({ message: 'Error al exportar proveedores' }), { status: 500 });
  }
}; 