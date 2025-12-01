import type { APIRoute } from "astro";
import db from "../../../db";
import {
  traslados,
  detalleTraslados,
  stockActual,
  productos,
} from "../../../db/schema";
import { createResponse } from "../../../types";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { trasladoId, userId } = body;

    if (!trasladoId) {
      return createResponse({ error: "ID de traslado requerido" }, 400);
    }

    // Validar estado actual
    const [trasladoActual] = await db
      .select()
      .from(traslados)
      .where(eq(traslados.id, trasladoId));

    if (!trasladoActual) {
      return createResponse({ error: "Traslado no encontrado" }, 404);
    }

    if (trasladoActual.estado !== "aprobado") {
      return createResponse(
        { error: "El traslado no está en estado aprobado para ser despachado" },
        400
      );
    }

    // Despachar en transacción
    const resultado = await db.transaction(async (trx) => {
      // 1. Obtener detalles para descontar stock
      const detalles = await trx
        .select()
        .from(detalleTraslados)
        .where(eq(detalleTraslados.trasladoId, trasladoId));

      for (const item of detalles) {
        // Validar stock en sucursal origen
        const [stockOrigen] = await trx
          .select()
          .from(stockActual)
          .where(
            and(
              eq(stockActual.productoId, item.productoId),
              eq(stockActual.depositosId, trasladoActual.depositoOrigenId)
            )
          );

        if (!stockOrigen || stockOrigen.cantidad < item.cantidadEnviada) {
          throw new Error(
            `Stock insuficiente para ${item.nombreProducto}. Disponible: ${
              stockOrigen?.cantidad || 0
            }, A enviar: ${item.cantidadEnviada}`
          );
        }

        // Descontar stock
        await trx
          .update(stockActual)
          .set({
            cantidad: stockOrigen.cantidad - item.cantidadEnviada,
          })
          .where(eq(stockActual.id, stockOrigen.id));
      }

      // 2. Actualizar estado del traslado
      const [trasladoUpdate] = await trx
        .update(traslados)
        .set({
          estado: "enviado",
          fechaEnvio: new Date(),
          enviadoPor: userId,
        })
        .where(eq(traslados.id, trasladoId))
        .returning();

      return trasladoUpdate;
    });

    return createResponse(
      {
        message: "Mercadería despachada exitosamente",
        data: resultado,
      },
      200
    );
  } catch (error: any) {
    console.error("Error al despachar:", error);
    return createResponse(
      {
        error: error.message || "Error al despachar la mercadería",
      },
      500
    );
  }
};
