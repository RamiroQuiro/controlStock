import type { APIRoute } from "astro";
import db from "../../../db";
import {
  traslados,
  depositos,
  detalleTraslados,
  users,
} from "../../../db/schema";
import { createResponse } from "../../../types";
import { eq, and, or, desc } from "drizzle-orm";

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const depositoId = url.searchParams.get("depositoId");
    const empresaId = request.headers.get("x-empresa-id"); // O obtener del usuario si está en sesión

    if (!depositoId) {
      return createResponse(400, "error: 'Falta el ID del depósito destino'");
    }

    // Buscar traslados pendientes o enviados hacia este depósito
    const trasladosPendientes = await db
      .select({
        id: traslados.id,
        numeroRemito: traslados.numeroRemito,
        fechaCreacion: traslados.fechaCreacion,
        estado: traslados.estado,
        observaciones: traslados.observaciones,
        cantidadItems: traslados.cantidadItems,
        origen: depositos.nombre,
        origenId: traslados.depositoOrigenId,
        enviadoPor: users.nombre, // Nombre del usuario que envió
      })
      .from(traslados)
      .innerJoin(depositos, eq(traslados.depositoOrigenId, depositos.id))
      .leftJoin(users, eq(traslados.enviadoPor, users.id))
      .where(
        and(
          eq(traslados.depositoDestinoId, depositoId),
          or(eq(traslados.estado, "pendiente"), eq(traslados.estado, "enviado"))
        )
      )
      .orderBy(desc(traslados.fechaCreacion));

    // Para cada traslado, obtener sus detalles
    const trasladosConDetalles = await Promise.all(
      trasladosPendientes.map(async (t) => {
        const detalles = await db
          .select()
          .from(detalleTraslados)
          .where(eq(detalleTraslados.trasladoId, t.id));

        return {
          ...t,
          detalles,
        };
      })
    );

    return createResponse(
      200,
      "Traslados pendientes obtenidos",
      trasladosConDetalles
    );
  } catch (error: any) {
    console.error("Error al obtener traslados pendientes:", error);
    return createResponse(500, error.message || "Error al obtener traslados");
  }
};
