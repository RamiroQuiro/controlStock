import { nanoid } from "nanoid";
import { sql, eq } from "drizzle-orm";
import type { APIContext } from "astro";
import { comprasProveedores, detalleCompras, movimientosStock, productos, stockActual } from "../../../db/schema";
import db from "../../../db";

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    const { productos: productosComprados, userId, data } = await request.json();

    console.log("Registrando compra", productosComprados, userId, data);

    if (!productosComprados?.length || !userId || !data.proveedorId) {
      return new Response(JSON.stringify({ status: 400, msg: "Datos inválidos o incompletos" }), { status: 400 });
    }

    if (data.total <= 0) {
      return new Response(JSON.stringify({ status: 402, msg: "El monto total debe ser mayor a 0" }), { status: 402 });
    }

    const compraDB = await db.transaction(async (trx) => {
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

      for (const prod of productosComprados) {
        // Verificar si el producto existe antes de actualizar stock
        const [productoExistente] = await trx.select().from(productos).where(eq(productos.id, prod.id));
        if (!productoExistente) {
          throw new Error(`El producto con ID ${prod.id} no existe`);
        }

        await trx.insert(detalleCompras).values({
          id: nanoid(),
          compraId,
          productoId: prod.id,
          cantidad: prod.cantidad,
          precioUnitario: prod.pCompra,
          subtotal: prod.cantidad * prod.pCompra,
        });

        // Actualizar stock de productos
        await trx.update(productos).set({
          stock: sql`${productos.stock} + ${prod.cantidad}`,
        }).where(eq(productos.id, prod.id));

        // Actualizar stockActual
        await trx.update(stockActual).set({
          cantidad: sql`${stockActual.cantidad} + ${prod.cantidad}`,
          updatedAt: Math.floor(Date.now() / 1000), // Timestamp Unix
        }).where(eq(stockActual.productoId, prod.id));

        // Registrar el movimiento en stock
        await trx.insert(movimientosStock).values({
          id: nanoid(),
          productoId: prod.id,
          cantidad: prod.cantidad,
          tipo: "ingreso",
          fecha: Math.floor(Date.now() / 1000),
          userId,
          proveedorId: data.proveedorId,
          motivo: "compra",
          observacion: data.observacion || null,
          clienteId: null,
        });
      }

      return compraRegistrada[0];
    });

    return new Response(JSON.stringify({ status: 200, msg: "Compra registrada con éxito", data: compraDB }));
  } catch (error) {
    console.error("Error en la compra:", error);
    return new Response(JSON.stringify({ status: 500, msg: "Error al registrar la compra", error: error.message }), { status: 500 });
  }
}
