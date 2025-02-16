import type { APIContext } from "astro";
import db from "../../../db";
import { detalleVentas, productos } from "../../../db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const GET = async ({ request, params }: APIContext) => {
  const userId = "1"; // Asegúrate de que este valor sea dinámico si es necesario

  try {
    const topMasVendidos = await db
      .select({
        producto: productos,
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as('totalVendido')
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .where(eq(productos.userId, userId))
      .groupBy(productos.id)
      .orderBy(desc(sql`totalVendido`))
      .limit(10);

    console.log('top vents',topMasVendidos);

    return new Response(
      JSON.stringify({
        msg: "ok",
        data: topMasVendidos
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error al obtener los productos más vendidos:", error);
    return new Response(
      JSON.stringify({ msg: "Error interno del servidor", error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
