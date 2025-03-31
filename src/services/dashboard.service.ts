import { and, count, eq, lte, sql } from "drizzle-orm";
import db from "../db";
import { clientes, detalleVentas, productos, ventas } from "../db/schema";

const stadisticasDash = async (userId: string) => {
  const mesHoy = new Date().getMonth() + 1;
  try {
    const dataDb = await db.transaction(async (trx) => {
      const nVentasDelMes = (
        await trx
          .select({ nVentasMes: count() })
          .from(ventas)
          .where(
            and(
              eq(ventas.userId, userId),
              sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch')) = ${mesHoy.toString().padStart(2, "0")}`
            )
          )
      ).at(0);
      const clientesNuevosMes = (
        await trx
          .select({ nClientesNuevos: count() })
          .from(clientes)
          .where(
            and(
              eq(clientes.userId, userId),
              sql`strftime('%m', datetime(${clientes.fechaAlta}, 'unixepoch')) = ${mesHoy.toString().padStart(2, "0")}`
            )
          )
      ).at(0);

      const productosBajoStock = (
        await trx
          .select({
            cantidadBajoStock: count(),
          })
          .from(productos)
          .where(
            and(
              eq(productos.userId, userId),
              lte(productos.stock, productos.alertaStock)
            )
          )
      ).at(0);

      const ultimasTransacciones = await trx
        .select({
          idVenta: ventas.id,
          cliente: clientes.nombre,
          fecha: ventas.fecha,
          total: ventas.total,
          metodoPago: ventas.metodoPago,
        })
        .from(ventas)
        .innerJoin(clientes, eq(clientes.id, ventas.clienteId))
        .where(eq(ventas.userId, userId))
        .limit(10);

      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
      const añoActual = fechaActual.getFullYear();

      const ventasPorCategoria = await trx
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
      const ventasAnteriores = await trx
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




      return {
        nVentasDelMes,
        categorias:rendimientoCategorias,
        rendimientoPromedio,
        productosBajoStock,
        clientesNuevosMes,
        ultimasTransacciones,
      };
    });
    return { dataDb };
  } catch (error) {
    console.log(error);
  }
};

export { stadisticasDash };
