import type { APIContext } from 'astro';
import db from '../../../db';
import {
  detalleVentas,
  movimientosStock,
  productos,
  stockActual,
  ventas,
} from '../../../db/schema';
import { nanoid } from 'nanoid';
import { eq, sql } from 'drizzle-orm';

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const {
      productos: productosSeleccionados,
      userId,
      empresaId,
      data,
    } = await request.json();
    const { user } = locals;
    const clienteId = data.clienteId === null ? user?.clienteDefault : data.clienteId;
    console.log('este es el cliente id', clienteId);
    // Validaciones previas
    if (!productosSeleccionados?.length || !empresaId || !userId || !data) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: 'Datos inválidos o incompletos',
        }),
        { status: 400 }
      );
    }

    if (data.total <= 0) {
      return new Response(
        JSON.stringify({
          status: 402,
          msg: 'El monto total de la venta debe ser mayor a 0',
        }),
        { status: 402 }
      );
    }

    const ventaDB = await db
      .transaction(async (trx) => {
        const ventaFinalizada = await trx
          .insert(ventas)
          .values({
            id: nanoid(12),
            empresaId,
            userId,
            clienteId,
            fecha: new Date(),
            ...data,
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
              tipo: 'egreso',
              fecha: new Date(),
              userId,
              empresaId,
              proveedorId: null,
              motivo: 'venta',
              clienteId
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
        msg: 'Venta finalizada con éxito',
        data: ventaDB,
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error al finalizar la venta',
      })
    );
  }
}
