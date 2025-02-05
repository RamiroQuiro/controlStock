import type { APIContext } from "astro";
import {Temporal} from 'temporal-polyfill'
import db from "../../../db";
import {
  detalleVentas,
  movimientosStock,
  productos,
  ventas,
} from "../../../db/schema";
import { nanoid } from "nanoid";
import { eq, sql } from "drizzle-orm";

export async function POST({ request, params }: APIContext): Promise<Response> {
  const {
    productos: productosSeleccionados,
    userId,
    totalVenta,
  } = await request.json();
  console.log(productosSeleccionados, userId, totalVenta);
  try {
    const ventaDB = await db.transaction(async (trx) => {
      const ventaFinalizada = await trx
        .insert(ventas)
        .values({
          id: nanoid(),
          userId,
          total: totalVenta,
        })
        .returning();
      // Procesar cada producto vendido
      await Promise.all(
        productosSeleccionados.map(async (prod) => {
          // Insertar en detalle de ventas
          await trx.insert(detalleVentas).values({
            id: nanoid(),
            ventaId: ventaFinalizada[0].id,
            productoId: prod.id,
            cantidad: prod.cantidad,
            precio: prod.precio,
          });

          // Actualizar el stock en la tabla productos
          await trx
            .update(productos)
            .set({
              stock: sql`${productos.stock} - ${prod.cantidad}`, // Restar la cantidad vendida
            })
            .where(eq(productos.id, prod.id));

            const fechaActual=Temporal.Now.toString();
            console.log(fechaActual)
          // Registrar el movimiento de stock
          await trx.insert(movimientosStock).values({
            id: nanoid(),
            productoId: prod.id,
            cantidad: prod.cantidad,
            tipo: "egreso", // Movimiento de salida
            fecha:fechaActual, // Timestamp Unix
            userId,
          });
        })
      );

      return ventaFinalizada;
    }).catch((error) => {
        console.log(error)
    }
    )
    
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Venta finalizada con éxito",
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error al finalizar la venta",
      })
    );
  }
}
