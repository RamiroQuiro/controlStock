import type { APIContext } from "astro";
import db from "../../../db";
import { nanoid } from "nanoid";
import { stockActual, productos, movimientosStock } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST({ request, params }: APIContext): Promise<Response> {
  const { userId } = params;

  if (!userId) {
    return new Response(
      JSON.stringify({ status: 400, msg: "Usuario no autenticado" }),
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
console.log(body)
    // Validación de los datos de entrada
    if (!body.productoId || !body.cantidad || !body.tipo) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: "Faltan datos requeridos: productoId, cantidad o tipo",
        }),
        { status: 400 }
      );
    }

    // Validar que cantidad sea un número positivo
    const cantidad = Number(body.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: "La cantidad debe ser un número positivo",
        }),
        { status: 400 }
      );
    }

    const transaccionDataBase = await db.transaction(async (trx) => {
      // Verificar si el producto existe
      const producto = (
        await trx.select().from(productos).where(eq(productos.id, body.productoId))
      ).at(0);

      if (!producto) {
        throw new Error("El producto no existe");
      }

      if (isNaN(producto.stock)) {
        throw new Error("El stock actual del producto no es válido");
      }

      // Generar ID para el movimiento
      const movimientoId = nanoid(13);

      // Insertar el movimiento de stock
      const [movimientoInsertado] = await trx
        .insert(movimientosStock)
        .values({
          id: movimientoId,
          userId,
          ...body,
        })
        .returning();

        console.log('entrada de body ->',body,'movimientoInsertado',movimientoInsertado,'producto',producto)
      // Calcular nuevo stock
      const nuevoStock =
        producto.stock + (movimientoInsertado.tipo === "ingreso" ? cantidad : -cantidad);

      if (nuevoStock < 0) {
        throw new Error("El stock no puede ser negativo");
      }

      // Actualizar el stock del producto
      await trx
        .update(productos)
        .set({ stock: nuevoStock })
        .where(eq(productos.id, body.productoId));

      // Actualizar stock actual
      await trx
        .update(stockActual)
        .set({ cantidad: nuevoStock })
        .where(eq(stockActual.productoId, body.productoId));
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Movimiento registrado con éxito",
      })
    );
  } catch (error) {
    console.error("Error al registrar el movimiento:", error);

    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error interno del servidor",
        error: error.message || "Error desconocido",
      }),
      { status: 500 }
    );
  }
}
