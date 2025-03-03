import type { APIRoute } from 'astro';
import { ventas } from '../../../../db/schema/ventas';
import { eq } from 'drizzle-orm';
import db from '../../../../db';

export const GET: APIRoute = async ({ params }) => {
  try {
    const clienteId = params.id;

    // Obtener todas las compras del cliente
    console.log(clienteId)
    const compras=await db.select().from(ventas).where(eq(ventas.clienteId,clienteId)).orderBy().limit(50)

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
          cantidadCompras: estadisticas.cantidadCompras
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