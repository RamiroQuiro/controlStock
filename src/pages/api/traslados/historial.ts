import type { APIRoute } from "astro";
import db from "../../../db";
import {
  traslados,
  depositos,
  detalleTraslados,
  users,
  productos,
} from "../../../db/schema";
import { createResponse } from "../../../types";
import { eq, and, gte, lte, desc, or, SQL } from "drizzle-orm";

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const empresaId = url.searchParams.get("empresaId");
    const estado = url.searchParams.get("estado"); // pendiente, enviado, recibido, cancelado
    const depositoId = url.searchParams.get("depositoId"); // Filtrar por origen o destino
    const fechaDesde = url.searchParams.get("fechaDesde");
    const fechaHasta = url.searchParams.get("fechaHasta");

    if (!empresaId) {
      return createResponse(400, "Falta el ID de la empresa");
    }

    // Construir condiciones dinámicamente
    const condiciones: SQL[] = [eq(traslados.empresaId, empresaId)];

    if (estado) {
      condiciones.push(eq(traslados.estado, estado));
    }

    if (depositoId) {
      // Buscar traslados donde el depósito sea origen O destino
      condiciones.push(
        or(
          eq(traslados.depositoOrigenId, depositoId),
          eq(traslados.depositoDestinoId, depositoId)
        )!
      );
    }

    if (fechaDesde) {
      condiciones.push(gte(traslados.fechaCreacion, new Date(fechaDesde)));
    }

    if (fechaHasta) {
      condiciones.push(lte(traslados.fechaCreacion, new Date(fechaHasta)));
    }

    // Obtener traslados con joins
    const historial = await db
      .select({
        id: traslados.id,
        numeroRemito: traslados.numeroRemito,
        fechaCreacion: traslados.fechaCreacion,
        fechaRecepcion: traslados.fechaRecepcion,
        estado: traslados.estado,
        observaciones: traslados.observaciones,
        cantidadItems: traslados.cantidadItems,
        depositoOrigenId: traslados.depositoOrigenId,
        depositoDestinoId: traslados.depositoDestinoId,
        // Joins para nombres
        origenNombre: depositos.nombre,
        enviadoPorNombre: users.nombre,
      })
      .from(traslados)
      .leftJoin(depositos, eq(traslados.depositoOrigenId, depositos.id))
      .leftJoin(users, eq(traslados.enviadoPor, users.id))
      .where(and(...condiciones))
      .orderBy(desc(traslados.fechaCreacion));

    // Para cada traslado, obtener el nombre del depósito destino
    const historialCompleto = await Promise.all(
      historial.map(async (t) => {
        const [depositoDestino] = await db
          .select({ nombre: depositos.nombre })
          .from(depositos)
          .where(eq(depositos.id, t.depositoDestinoId));

        // Obtener detalles del traslado con nombres de productos
        const detalles = await db
          .select({
            id: detalleTraslados.id,
            trasladoId: detalleTraslados.trasladoId,
            productoId: detalleTraslados.productoId,
            cantidadSolicitada: detalleTraslados.cantidadSolicitada,
            cantidadEnviada: detalleTraslados.cantidadEnviada,
            cantidadRecibida: detalleTraslados.cantidadRecibida,
            diferencia: detalleTraslados.diferencia,
            motivoDiferencia: detalleTraslados.motivoDiferencia,
            nombreProducto: productos.nombre,
            codigoProducto: productos.codigoBarra,
          })
          .from(detalleTraslados)
          .leftJoin(productos, eq(detalleTraslados.productoId, productos.id))
          .where(eq(detalleTraslados.trasladoId, t.id));

        return {
          ...t,
          destinoNombre: depositoDestino?.nombre || "Desconocido",
          detalles,
        };
      })
    );

    return createResponse(
      200,
      "Historial de traslados obtenido",
      historialCompleto
    );
  } catch (error: any) {
    console.error("Error al obtener historial de traslados:", error);
    return createResponse(500, error.message || "Error al obtener historial");
  }
};
