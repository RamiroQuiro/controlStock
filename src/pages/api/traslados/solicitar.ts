import type { APIRoute } from "astro";
import db from "../../../db";
import {
  traslados,
  detalleTraslados,
  productos,
  comprobanteNumeracion,
} from "../../../db/schema";
import { createResponse } from "../../../types";
import { eq, and } from "drizzle-orm";
import { normalizadorUUID } from "../../../utils/normalizadorUUID";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      sucursalOrigenId, // Casa Central (a quien se le pide)
      sucursalDestinoId, // Sucursal (quien pide)
      observaciones,
      productos: productosSolicitados,
      userId,
      empresaId,
    } = body;

    // Validaciones básicas
    if (!sucursalOrigenId || !sucursalDestinoId) {
      return createResponse(
        { error: "Debe especificar sucursal origen y destino" },
        400
      );
    }

    if (sucursalOrigenId === sucursalDestinoId) {
      return createResponse(
        { error: "La sucursal origen y destino no pueden ser la misma" },
        400
      );
    }

    if (!productosSolicitados || productosSolicitados.length === 0) {
      return createResponse(
        { error: "Debe incluir al menos un producto" },
        400
      );
    }

    // Crear solicitud en transacción
    const resultado = await db.transaction(async (trx) => {
      // 1. Obtener y actualizar el número de remito (o solicitud)
      // Usaremos la misma numeración de REMITO_TRASLADO por ahora,
      // o podríamos crear una nueva numeración para SOLICITUDES.
      // Dado que eventualmente será un remito, tiene sentido reservar el número o usar uno provisorio.
      // Por simplicidad y para seguir el flujo, usaremos REMITO_TRASLADO pero sabiendo que es una solicitud.

      const [numeracion] = await trx
        .select()
        .from(comprobanteNumeracion)
        .where(
          and(
            eq(comprobanteNumeracion.empresaId, empresaId),
            eq(comprobanteNumeracion.tipo, "REMITO_TRASLADO")
          )
        );

      if (!numeracion) {
        throw new Error(
          "No se encontró la numeración para remitos de traslado"
        );
      }

      const nuevoNumero = numeracion.numeroActual + 1;

      // Actualizar el número actual
      await trx
        .update(comprobanteNumeracion)
        .set({
          numeroActual: nuevoNumero,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(comprobanteNumeracion.empresaId, empresaId),
            eq(comprobanteNumeracion.tipo, "REMITO_TRASLADO")
          )
        );

      // 2. Crear el registro de traslado con estado 'solicitado'
      const trasladoId = normalizadorUUID("traslado", 14);
      const cantidadItems = productosSolicitados.length;

      const [trasladoCreado] = await trx
        .insert(traslados)
        .values({
          id: trasladoId,
          empresaId,
          depositoOrigenId: sucursalOrigenId, // Origen es de donde sale la mercadería (Casa Central)
          depositoDestinoId: sucursalDestinoId, // Destino es quien recibe (Sucursal)
          creadoPor: userId, // Usuario que solicita
          estado: "solicitado",
          observaciones: observaciones || null,
          cantidadItems,
          fechaCreacion: new Date(),
          numeroRemito: nuevoNumero,
          motivoTraslado: "reposicion", // Default
        })
        .returning();

      // 3. Crear detalles del traslado
      const detalles = [];

      for (const prod of productosSolicitados) {
        // Obtener datos actuales del producto para snapshot
        const [productoActual] = await trx
          .select()
          .from(productos)
          .where(eq(productos.id, prod.id));

        if (!productoActual) {
          throw new Error(`Producto no encontrado: ${prod.id}`);
        }

        // Crear detalle del traslado
        const detalleId = normalizadorUUID("detalle-traslado", 14);
        const [detalle] = await trx
          .insert(detalleTraslados)
          .values({
            id: detalleId,
            trasladoId,
            productoId: prod.id,
            cantidadEnviada: 0, // Aún no se envía nada
            cantidadSolicitada: prod.cantidad, // Lo que se pide
            diferencia: null,
            // Snapshots
            nombreProducto: productoActual.nombre,
            codigoProducto: productoActual.codigoBarra,
            cantidadRecibida: null,
          })
          .returning();

        detalles.push(detalle);
      }

      return { traslado: trasladoCreado, detalles };
    });

    return createResponse(
      {
        message: "Solicitud creada exitosamente",
        data: resultado,
      },
      201
    );
  } catch (error: any) {
    console.error("Error al crear solicitud:", error);
    return createResponse(
      {
        error: error.message || "Error al crear la solicitud",
      },
      500
    );
  }
};
