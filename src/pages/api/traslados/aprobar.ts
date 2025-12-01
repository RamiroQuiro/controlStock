import type { APIRoute } from "astro";
import db from "../../../db";
import { traslados, detalleTraslados } from "../../../db/schema";
import { createResponse } from "../../../types";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { trasladoId, itemsAprobados, userId } = body;

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

    if (trasladoActual.estado !== "solicitado") {
      return createResponse(
        { error: "El traslado no está en estado solicitado" },
        400
      );
    }

    // Actualizar en transacción
    const resultado = await db.transaction(async (trx) => {
      // 1. Actualizar estado del traslado
      const [trasladoUpdate] = await trx
        .update(traslados)
        .set({
          estado: "aprobado",
          // Podríamos guardar quien aprobó si tuviéramos campo 'aprobadoPor'
          // Por ahora usamos observaciones o logs si fuera necesario
        })
        .where(eq(traslados.id, trasladoId))
        .returning();

      // 2. Actualizar cantidades aprobadas (cantidadEnviada)
      // Si itemsAprobados viene, usamos esos valores. Si no, copiamos cantidadSolicitada a cantidadEnviada.

      if (itemsAprobados && Array.isArray(itemsAprobados)) {
        for (const item of itemsAprobados) {
          await trx
            .update(detalleTraslados)
            .set({
              cantidadEnviada: item.cantidadAprobada,
            })
            .where(
              and(
                eq(detalleTraslados.trasladoId, trasladoId),
                eq(detalleTraslados.productoId, item.productoId)
              )
            );
        }
      } else {
        // Si no se especifican cambios, se aprueba todo lo solicitado
        // Copiamos cantidadSolicitada -> cantidadEnviada
        // Esto requiere leer los detalles primero o hacer un update masivo con sql raw si fuera posible,
        // pero Drizzle no soporta update con join/select fácilmente en SQLite standard sin extensiones a veces.
        // Lo haremos iterando.

        const detalles = await trx
          .select()
          .from(detalleTraslados)
          .where(eq(detalleTraslados.trasladoId, trasladoId));

        for (const det of detalles) {
          await trx
            .update(detalleTraslados)
            .set({
              cantidadEnviada: det.cantidadSolicitada,
            })
            .where(eq(detalleTraslados.id, det.id));
        }
      }

      return trasladoUpdate;
    });

    return createResponse(
      {
        message: "Solicitud aprobada exitosamente",
        data: resultado,
      },
      200
    );
  } catch (error: any) {
    console.error("Error al aprobar solicitud:", error);
    return createResponse(
      {
        error: error.message || "Error al aprobar la solicitud",
      },
      500
    );
  }
};
