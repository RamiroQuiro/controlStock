// pages/api/proveedores/[id]/estadisticas.ts
import type { APIRoute } from 'astro';
import { comprasProveedores, proveedores } from '../../../../db/schema';
import { and, desc, eq } from 'drizzle-orm';
import db from '../../../../db';
import { calcularEstadisticasMensuales, calcularEstadisticasProveedor } from '../../../../utils/calculoEstadisticaProveedor';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const proveedorId = params.id;
    const userId = request.headers.get('x-user-id');

    // Obtener datos del proveedor
    const [proveedor] = await db
      .select()
      .from(proveedores)
      .where(eq(proveedores.id, proveedorId));

    // Obtener todas las compras
    const compras = await db
      .select()
      .from(comprasProveedores)
      .where(
        and(
          eq(comprasProveedores.proveedorId, proveedorId),
          eq(comprasProveedores.userId, userId)
        )
      )
      .orderBy(desc(comprasProveedores.fecha));
console.log('obtencion de compras ->',compras)
    // Calcular estadísticas actuales
    const estadisticasActuales = calcularEstadisticasProveedor(
      compras,
      10000 // proveedor.limiteCredito
    )

    // Calcular estadísticas mensuales
    const estadisticasMensuales = calcularEstadisticasMensuales(compras);

    // Calcular estadísticas del mes anterior para tendencias
    const comprasMesAnterior = compras.filter(compra => {
      const fecha = new Date(compra.fecha);
      const mesAnterior = new Date();
      mesAnterior.setMonth(mesAnterior.getMonth() - 1);
      return fecha.getMonth() === mesAnterior.getMonth() &&
             fecha.getFullYear() === mesAnterior.getFullYear();
    });

    const estadisticasMesAnterior = calcularEstadisticasProveedor(
      comprasMesAnterior,
      10000 // proveedor.limiteCredito
    );

    // Calcular tendencias
    const tendencias = calcularTendencias(
      estadisticasActuales,
      estadisticasMesAnterior
    );

    return new Response(
      JSON.stringify({
        estadisticas: estadisticasActuales,
        estadisticasMensuales,
        tendencias,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener estadísticas' }), 
      { status: 500 }
    );
  }
};