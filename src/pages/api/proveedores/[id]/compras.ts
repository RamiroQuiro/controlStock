import type { APIRoute } from 'astro';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import db from '../../../../db';
import {
  comprasProveedores,
  detalleCompras,
  movimientosStock,
  productos,
  proveedores,
} from '../../../../db/schema';

export const GET: APIRoute = async ({ params, locals, request }) => {
  // const userId = request.headers.get('x-user-id'); // Asumiendo que tienes el userId en headers
  const { user } = locals;
  const empresaId = user?.empresaId;
  const userId = user?.id;
  try {
    const proveedorId = params.id;

    console.log('provedore y empresa ->', proveedorId, empresaId);

    // Obtener todas las compras del cliente
    const compras = await db
      .select()
      .from(comprasProveedores)
      .where(
        and(
          eq(comprasProveedores.proveedorId, proveedorId),
          eq(comprasProveedores.empresaId, empresaId)
        )
      )
      .orderBy(desc(comprasProveedores.fecha)) // Puedes ordenar por fecha si lo necesitas
      .limit(25);

    console.log('compras', compras, 'userId->', userId);
    // Calcular estadísticas
    // cantiada y monto gastado
    const estadisticas = compras.reduce(
      (acc, compra) => {
        return {
          totalGastado: acc.totalGastado + compra.total,
          cantidadCompras: acc.cantidadCompras + 1,
        };
      },
      { totalGastado: 0, cantidadCompras: 0 }
    );

    // Calcular promedios y frecuencia
    const promedioCompra =
      estadisticas.cantidadCompras > 0
        ? estadisticas.totalGastado / estadisticas.cantidadCompras
        : 0;

    // Obtener los detalles de las compras
    const detalles = await db
      .select()
      .from(detalleCompras)
      .where(
        inArray(
          detalleCompras.compraId,
          compras.map((c) => c.id)
        )
      );

    console.log('detalles', detalles);
    // Función para calcular la variación de precios
    function calcularVariacionPrecios(detalles: any[]) {
      const productosMap = new Map();

      for (const detalle of detalles) {
        if (!productosMap.has(detalle.productoId)) {
          productosMap.set(detalle.productoId, []);
        }
        productosMap.get(detalle.productoId).push(detalle);
      }

      const variacionPrecios = [];

      for (const [productoId, detallesProducto] of productosMap) {
        // Ordenar por fecha de compra (descendente)
        const detallesOrdenados = detallesProducto.sort(
          (a, b) =>
            compras.find((c) => c.id === b.compraId)?.fecha -
            compras.find((c) => c.id === a.compraId)?.fecha
        );

        if (detallesOrdenados.length < 2) continue; // Si solo hay una compra, no hay variación

        const precioActual = detallesOrdenados[0].pCompra;
        const precioAnterior = detallesOrdenados[1].pCompra;
        const variacion =
          ((precioActual - precioAnterior) / precioAnterior) * 100;

        variacionPrecios.push({
          productoId: detalle.productoId,
          nombreProducto: detalle.nombreProducto,
          precioAnterior,
          precioActual,
          variacion,
        });
      }
      return variacionPrecios;
    }

    console.log('detalles', detalles);
    // Calcular variación de precios
    const variacionPrecios = calcularVariacionPrecios(detalles);
    console.log('variacionPrecios', variacionPrecios);

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
          'totalVendido'
        ),
      })
      .from(detalleCompras)
      .innerJoin(productos, eq(detalleCompras.productoId, productos.id))
      .innerJoin(
        comprasProveedores,
        eq(comprasProveedores.id, detalleCompras.compraId)
      )
      .where(
        and(
          eq(comprasProveedores.proveedorId, proveedorId),
          eq(productos.empresaId, empresaId)
        )
      )
      .groupBy(productos.id)
      .orderBy(desc(sql`totalVendido`))
      .limit(10);

    console.log(productosMasVendidos);
    // Retornar respuesta

    return new Response(
      JSON.stringify({
        compras: compras.map((compra) => ({
          id: compra.id,
          fecha: compra.fecha,
          total: compra.total,
          estado: compra.estado,
        })),
        estadisticas: {
          totalGastado: estadisticas.totalGastado,
          promedioCompra,
          frecuenciaCompra: Math.round(frecuenciaCompra),
          cantidadCompras: estadisticas.cantidadCompras,
          ultimaCompra: compras.length > 0 ? compras[0].fecha : null,
          productosMasVendidos,
          variacionPrecios,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener historial de compras:', error);
    return new Response(
      JSON.stringify({
        message: 'Error al obtener historial de compras',
      }),
      { status: 500 }
    );
  }
};
