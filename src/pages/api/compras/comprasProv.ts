import { nanoid } from "nanoid";

import { sql, eq } from "drizzle-orm";
import type { APIContext } from "astro";
import { comprasProveedores, detalleCompras, movimientosStock, productos } from "../../../db/schema";
import db from "../../../db";

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    const {
      productos: productosComprados,
      userId,
      data,
    } = await request.json();

    console.log("Registrando compra", productosComprados, userId, data);

    if (!productosComprados?.length || !userId || !data.proveedorId) {
      return new Response(
        JSON.stringify({ status: 400, msg: "Datos inválidos o incompletos" }),
        { status: 400 }
      );
    }

    if (data.total <= 0) {
      return new Response(
        JSON.stringify({ status: 402, msg: "El monto total debe ser mayor a 0" }),
        { status: 402 }
      );
    }

    const compraDB = await db.transaction(async (trx) => {
        // Registrar la compra
        const compraId = nanoid();
      
        const compraRegistrada = await trx
        .insert(comprasProveedores)
        .values({
          id: compraId,
          userId,
          proveedorId: data.proveedorId,
          metodoPago: data.metodoPago,
          nComprobante: data.nComprobante,
          nCheque: data.nCheque,
          vencimientoCheque: data.vencimientoCheque,
          total: data.total,
          impuesto: data.impuesto,
          descuento: data.descuento
        })
        .returning();

      await Promise.all(
        productosComprados.map(async (prod) => {
          await trx.insert(detalleCompras).values({
            id: nanoid(),
            compraId: compraId,
            productoId: prod.id,
            cantidad: prod.cantidad,
            precioUnitario: prod.pCompra,
            subtotal: prod.cantidad * prod.pCompra,
          });

          await trx
            .update(productos)
            .set({
              stock: sql`${productos.stock} + ${prod.cantidad}`,
            })
            .where(eq(productos.id, prod.id));

          await trx.insert(movimientosStock).values({
            id: nanoid(12),
            productoId: prod.id,
            cantidad: prod.cantidad,
            tipo: "ingreso",
            fecha: new Date(),
            userId,
            proveedorId: data.proveedorId,
            motivo: "compra",
            observacion: data.observacion || null,
            clienteId: null,
          });
        })
      );

      return compraRegistrada[0];
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Compra registrada con éxito",
        data: compraDB,
      })
    );
  } catch (error) {
    console.error("Error en la compra:", error);
    return new Response(
      JSON.stringify({ status: 500, msg: "Error al registrar la compra" }),
      { status: 500 }
    );
  }
}
