import type { APIRoute } from "astro";
import db from "../../../db";
import {
  traslados,
  detalleTraslados,
  stockActual,
  productos,
  comprobanteNumeracion,
  comprobantes,
} from "../../../db/schema";
import { createResponse } from "../../../types";
import { eq, and, desc } from "drizzle-orm";
import { normalizadorUUID } from "../../../utils/normalizadorUUID";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      sucursalOrigenId,
      sucursalDestinoId,
      observaciones,
      productos: productosTraslado,
      userId,
      empresaId,
    } = body;

    console.log(
      "datos entratne ->",
      sucursalDestinoId,
      sucursalOrigenId,
      observaciones,
      productosTraslado,
      userId,
      empresaId
    );

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

    if (!productosTraslado || productosTraslado.length === 0) {
      return createResponse(
        { error: "Debe incluir al menos un producto" },
        400
      );
    }

    // Crear traslado en transacción
    const resultado = await db.transaction(async (trx) => {
      // 1. Obtener y actualizar el número de remito
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

      // 2. Crear el registro de traslado
      const trasladoId = normalizadorUUID("traslado", 14);
      const cantidadItems = productosTraslado.length;

      const [trasladoCreado] = await trx
        .insert(traslados)
        .values({
          id: trasladoId,
          empresaId,
          depositoOrigenId: sucursalOrigenId,
          depositoDestinoId: sucursalDestinoId,
          enviadoPor: userId,
          estado: "pendiente", // Estados: pendiente, enviado, recibido, cancelado
          observaciones: observaciones || null,
          cantidadItems,
          creadoPor: userId,
          fechaCreacion: new Date(),
          numeroRemito: nuevoNumero,
        })
        .returning();

      // 2. Crear detalles del traslado y validar stock
      const detalles = [];

      for (const prod of productosTraslado) {
        // Validar stock en sucursal origen
        const [stockOrigen] = await trx
          .select()
          .from(stockActual)
          .where(
            and(
              eq(stockActual.productoId, prod.id),
              eq(stockActual.depositosId, sucursalOrigenId)
            )
          );

        if (!stockOrigen || stockOrigen.cantidad < prod.cantidad) {
          throw new Error(
            `Stock insuficiente para ${prod.descripcion}. Disponible: ${stockOrigen?.cantidad || 0}, Solicitado: ${prod.cantidad}`
          );
        }

        // Obtener datos actuales del producto para snapshot
        const [productoActual] = await trx
          .select()
          .from(productos)
          .where(eq(productos.id, prod.id));

        // Crear detalle del traslado
        const detalleId = normalizadorUUID("detalle-traslado", 14);
        const [detalle] = await trx
          .insert(detalleTraslados)
          .values({
            id: detalleId,
            trasladoId,
            productoId: prod.id,
            cantidadEnviada: prod.cantidad,
            cantidadSolicitada: 0, // Se actualiza al recibir
            diferencia: null,
            // Snapshots para histórico
            nombreProducto: productoActual.nombre,
            codigoProducto: productoActual.codigoBarra,
            cantidadRecibida: null,
          })
          .returning();

        detalles.push(detalle);

        // 3. Descontar stock de la sucursal origen
        await trx
          .update(stockActual)
          .set({
            cantidad: stockOrigen.cantidad - prod.cantidad,
          })
          .where(eq(stockActual.id, stockOrigen.id));
      }
      const [comprobanteCreado] = await trx
        .insert(comprobantes)
        .values({
          id: normalizadorUUID("remito", 14),
          empresaId,
          tipo: "REMITO_TRASLADO",
          puntoVenta: 1,
          numero: nuevoNumero,
          numeroFormateado: nuevoNumero,
          fecha: new Date(),
          fechaEmision: new Date(),
          clienteId: null,
          total: 0,
          estado: "pendiente",
        })
        .returning();
      return { traslado: trasladoCreado, detalles };
    });

    return createResponse(
      {
        message: "Traslado creado exitosamente",
        data: resultado,
      },
      201
    );
  } catch (error: any) {
    console.error("Error al crear traslado:", error);
    return createResponse(
      {
        error: error.message || "Error al crear el traslado",
      },
      500
    );
  }
};
