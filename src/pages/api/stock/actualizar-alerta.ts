import type { APIRoute } from "astro";
import db from "../../../db";
import { stockActual } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { createResponse } from "../../../types";

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const { user } = locals;
    if (!user) {
      return createResponse(401, "No autenticado");
    }

    const { stockId, alertaStock, reservado } = await request.json();

    if (!stockId) {
      return createResponse(400, "Falta el ID del stock");
    }

    // Validar que los valores sean números válidos
    if (alertaStock !== undefined && (isNaN(alertaStock) || alertaStock < 0)) {
      return createResponse(400, "Alerta de stock inválida");
    }

    if (reservado !== undefined && (isNaN(reservado) || reservado < 0)) {
      return createResponse(400, "Cantidad reservada inválida");
    }

    // Construir objeto de actualización solo con campos definidos
    const updateData: any = {};
    if (alertaStock !== undefined) updateData.alertaStock = alertaStock;
    if (reservado !== undefined) updateData.reservado = reservado;

    if (Object.keys(updateData).length === 0) {
      return createResponse(400, "No hay datos para actualizar");
    }

    // Actualizar en la base de datos
    const [updated] = await db
      .update(stockActual)
      .set(updateData)
      .where(eq(stockActual.id, stockId))
      .returning();

    if (!updated) {
      return createResponse(404, "Stock no encontrado");
    }

    return createResponse(200, "Stock actualizado correctamente", updated);
  } catch (error: any) {
    console.error("Error al actualizar stock:", error);
    return createResponse(500, error.message || "Error al actualizar stock");
  }
};
