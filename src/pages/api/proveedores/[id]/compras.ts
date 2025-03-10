import type { APIRoute } from 'astro';
import { and, desc, eq, sql } from 'drizzle-orm';
import db from '../../../../db';
import { comprasProveedores, detalleCompras, movimientosStock, productos, proveedores } from '../../../../db/schema';

export const GET: APIRoute = async ({ params ,request}) => {
  const userId = request.headers.get('x-user-id'); // Asumiendo que tienes el userId en headers
  try {
    const proveedorId = params.id;

    // Obtener todas las compras del cliente
    const compras = await db
    .select()
    .from(comprasProveedores)
    .where(
      and(
        eq(comprasProveedores.proveedorId, proveedorId),
        eq(comprasProveedores.userId, userId)
      )
    )
    .orderBy(desc(comprasProveedores.fecha)) // Puedes ordenar por fecha si lo necesitas
    .limit(25);
  
    console.log('compras', compras,'userId->',userId);
    // Calcular estadísticas
    const estadisticas = compras.reduce((acc, compra) => {
      return {
        totalGastado: acc.totalGastado + compra.total,
        cantidadCompras: acc.cantidadCompras + 1,
      };
    }, { totalGastado: 0, cantidadCompras: 0 });

    // Calcular promedios y frecuencia
    const promedioCompra = estadisticas.cantidadCompras > 0 
      ? estadisticas.totalGastado / estadisticas.cantidadCompras 
      : 0;

    // Calcular frecuencia de compra (en días)
    let frecuenciaCompra = 0;
    if (compras.length >= 2) {
      const primerCompra = compras[compras.length - 1].fecha;
      const ultimaCompra = compras[0].fecha;
      const diasTotales = (ultimaCompra - primerCompra) / (24 * 60 * 60); // Convertir segundos a días
      frecuenciaCompra = diasTotales / (compras.length - 1);
    }

    const productosMasVendidos = await db
            .select({
              producto: productos,
              totalVendido: sql<number>`sum(${detalleCompras.cantidad})`.as(
                "totalVendido"
              ),
            })
            .from(detalleCompras)
            .innerJoin(productos, eq(detalleCompras.productoId, productos.id))
            .where(eq(productos.userId, userId))
            .groupBy(productos.id)
            .orderBy(desc(sql`totalVendido`))
            .limit(10);

  

    console.log(productosMasVendidos)
    // Retornar respuesta

    return new Response(
      JSON.stringify({
        compras: compras.map(compra => ({
          id: compra.id,
          fecha: compra.fecha,
          total: compra.total,
          estado: compra.estado
        })),
        estadisticas: {
          totalGastado: estadisticas.totalGastado,
          promedioCompra,
          frecuenciaCompra: Math.round(frecuenciaCompra),
          cantidadCompras: estadisticas.cantidadCompras,
          ultimaCompra: compras.length > 0 ? compras[0].fecha : null,
          productosMasVendidos
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener historial de compras:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error al obtener historial de compras' 
      }), 
      { status: 500 }
    );
  }
}; 