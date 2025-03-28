import { and, count, eq, lte, sql } from "drizzle-orm";
import db from "../db";
import { clientes, productos, ventas } from "../db/schema";

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

      return {
        nVentasDelMes,
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
