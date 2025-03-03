import type { APIContext } from "astro";
import db from "../../../db";
import {
  detalleVentas,
  movimientosStock,
  productos,
  stockActual,
  ventas,
} from "../../../db/schema";
import { nanoid } from "nanoid";
import { eq, sql } from "drizzle-orm";

export async function POST({ request, params }: APIContext): Promise<Response> {
  try {
    
    const {
    productos: productosSeleccionados,
    userId,
   data
  } = await request.json();
  console.log('finalizando venta',productosSeleccionados, userId,data);

  // Validaciones previas
  if (!productosSeleccionados?.length || !userId || !data.clienteId) {
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "Datos inválidos o incompletos",
      }),
      { status: 400 }
    );
  }

  if (data.total <= 0) {
    return new Response(
      JSON.stringify({
        status: 402,
        msg: "El monto total de la venta debe ser mayor a 0",
      }),
      { status: 402 }
    );
  }
 
    const ventaDB = await db
      .transaction(async (trx) => {
        const ventaFinalizada = await trx
          .insert(ventas)
          .values({
            id: nanoid(),
            userId,
          ...data
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
              precio: prod.pVenta,
            });

            // Actualizar el stock en la tabla productos
            await trx
              .update(productos)
              .set({
                stock: sql`${productos.stock} - ${prod.cantidad}`, // Restar la cantidad vendida
              })
              .where(eq(productos.id, prod.id));

            await trx
              .update(stockActual)
              .set({
                cantidad: sql`${stockActual.cantidad} - ${prod.cantidad}`,
                updatedAt: sql`(strftime('%s','now'))`,
              })
              .where(eq(stockActual.productoId, prod.id));
            await trx.insert(movimientosStock).values({
              id: nanoid(12),
              productoId: prod.id,
              cantidad: prod.cantidad,
              tipo: "egreso",
              fecha:new Date(),
              userId,
              proveedorId: null,
              motivo: "venta",
              clienteId:data.clienteId,
            });
          })
        );

        return ventaFinalizada[0];
      })
      .catch((error) => {
        console.log(error);
      });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Venta finalizada con éxito",
        data:ventaDB
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
