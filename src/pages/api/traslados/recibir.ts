import type { APIRoute } from "astro";
import db from "../../../db";
import { traslados, detalleTraslados, stockActual } from "../../../db/schema";
import { createResponse } from "../../../types";
import { eq, and } from "drizzle-orm";
import { normalizadorUUID } from "../../../utils/normalizadorUUID";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      trasladoId,
      productosRecibidos, // Array con { productoId, cantidadRecibida }
      userId,
    } = body;

    // Validaciones
    if (!trasladoId) {
      return createResponse(400, "Debe especificar el ID del traslado");
    }

    if (!productosRecibidos || productosRecibidos.length === 0) {
      return createResponse(400, "Debe especificar los productos recibidos");
    }

    // Procesar recepción en transacción
    const resultado = await db.transaction(async (trx) => {
      // 1. Obtener el traslado
      const [traslado] = await trx
        .select()
        .from(traslados)
        .where(eq(traslados.id, trasladoId));

      if (!traslado) {
        throw new Error("Traslado no encontrado");
      }

      if (traslado.estado === "recibido") {
        throw new Error("Este traslado ya fue recibido");
      }

      if (traslado.estado === "cancelado") {
        throw new Error("Este traslado fue cancelado");
      }

      // 2. Actualizar detalles y stock
      for (const prodRecibido of productosRecibidos) {
        // Obtener detalle del traslado
        const [detalle] = await trx
          .select()
          .from(detalleTraslados)
          .where(
            and(
              eq(detalleTraslados.trasladoId, trasladoId),
              eq(detalleTraslados.productoId, prodRecibido.productoId)
            )
          );

        if (!detalle) {
          throw new Error(
            `Producto ${prodRecibido.productoId} no encontrado en el traslado`
          );
        }

        const diferencia =
          prodRecibido.cantidadRecibida - detalle.cantidadEnviada;

        // Actualizar detalle con cantidad recibida
        await trx
          .update(detalleTraslados)
          .set({
            cantidadRecibida: prodRecibido.cantidadRecibida,
            diferencia,
          })
          .where(eq(detalleTraslados.id, detalle.id));

        // 3. Actualizar stock en sucursal destino
        const [stockDestino] = await trx
          .select()
          .from(stockActual)
          .where(
            and(
              eq(stockActual.productoId, prodRecibido.productoId),
              eq(stockActual.depositosId, traslado.depositoDestinoId)
            )
          );

        if (stockDestino) {
          // Si ya existe stock, sumar
          await trx
            .update(stockActual)
            .set({
              cantidad: stockDestino.cantidad + prodRecibido.cantidadRecibida,
            })
            .where(eq(stockActual.id, stockDestino.id));
        } else {
          // Si no existe, crear nuevo registro de stock
          await trx.insert(stockActual).values({
            id: normalizadorUUID("stock", 14),
            productoId: prodRecibido.productoId,
            depositosId: traslado.depositoDestinoId,
            cantidad: prodRecibido.cantidadRecibida,
            alertaStock: 5,
            empresaId: traslado.empresaId,
          });
        }

        // 4. Si hay diferencia negativa (faltante), ajustar stock origen
        if (diferencia < 0) {
          // Devolver al stock origen lo que no llegó
          const [stockOrigen] = await trx
            .select()
            .from(stockActual)
            .where(
              and(
                eq(stockActual.productoId, prodRecibido.productoId),
                eq(stockActual.depositosId, traslado.depositoOrigenId)
              )
            );

          if (stockOrigen) {
            await trx
              .update(stockActual)
              .set({
                cantidad: stockOrigen.cantidad + Math.abs(diferencia),
              })
              .where(eq(stockActual.id, stockOrigen.id));
          }
        }
      }

      // 5. Actualizar estado del traslado
      const [trasladoActualizado] = await trx
        .update(traslados)
        .set({
          estado: "recibido",
          recibidoPor: userId,
          fechaRecepcion: new Date(),
        })
        .where(eq(traslados.id, trasladoId))
        .returning();

      return trasladoActualizado;
    });

    return createResponse(200, "Traslado recibido exitosamente", resultado);
  } catch (error: any) {
    console.error("Error al recibir traslado:", error);
    return createResponse(500, error.message || "Error al recibir el traslado");
  }
};
