import type { APIRoute } from "astro";
import db from "../../../db";
import { ventas, detalleVentas, productos } from "../../../db/schema";
import { and, eq, sql } from "drizzle-orm";

export const GET: APIRoute = async ({ request }) => {
  const userId = request.headers.get("x-user-id");
  const filtroSelector = request.headers.get("filtro-selector") || "mesActual";

  try {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
    const añoActual = fechaActual.getFullYear();

    // Consulta para el período actual
    const ventasPorCategoria = await db
      .select({
        categoria: productos.categoria,
        totalVentas: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`,
        cantidadVentas: sql<number>`sum(${detalleVentas.cantidad})`,
      })
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .where(
        and(
          eq(productos.userId, userId),
          sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch')) = ${mesActual.toString().padStart(2, "0")}`
        )
      )
      .groupBy(productos.categoria);

    // Consulta para el período anterior (para calcular tendencias)
    const ventasAnteriores = await db
      .select({
        categoria: productos.categoria,
        totalVentas: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`,
        cantidadVentas: sql<number>`sum(${detalleVentas.cantidad})`,
      })
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .where(
        and(
          eq(productos.userId, userId),
          sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch')) = ${mesAnterior.toString().padStart(2, "0")}`
        )
      )
      .groupBy(productos.categoria);

    // Calcular rendimiento y tendencias
    const rendimientoCategorias = ventasPorCategoria.map((catActual) => {
      const catAnterior = ventasAnteriores.find(
        (cat) => cat.categoria === catActual.categoria
      );

      const porcentaje = Math.round(
        (catActual.cantidadVentas /
          ventasPorCategoria.reduce(
            (acc, curr) => acc + curr.cantidadVentas,
            0
          )) *
          100
      );

      let tendencia: "subida" | "bajada" | "estable" = "estable";
      if (catAnterior) {
        const diferencia = catActual.totalVentas - catAnterior.totalVentas;
        tendencia =
          diferencia > 0 ? "subida" : diferencia < 0 ? "bajada" : "estable";
      }

      return {
        nombre: catActual.categoria,
        porcentaje,
        totalVentas: catActual.totalVentas,
        tendencia,
        color: `text-primary-${((porcentaje % 5) + 1) * 100}`, // Asigna color dinámicamente
      };
    });

    // Calcular rendimiento promedio
    const rendimientoPromedio = Math.round(
      rendimientoCategorias.reduce((acc, curr) => acc + curr.porcentaje, 0) /
        rendimientoCategorias.length
    );

    return new Response(
      JSON.stringify({
        categorias: rendimientoCategorias,
        rendimientoPromedio,
        msg: "Datos obtenidos correctamente",
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        msg: "Error al obtener estadísticas",
        status: 500,
      }),
      { status: 500 }
    );
  }
};
