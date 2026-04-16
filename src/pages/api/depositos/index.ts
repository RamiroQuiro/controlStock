import type { APIRoute } from "astro";
import { and, eq, like, count } from "drizzle-orm";
import { generateId } from "lucia";
import { createResponse } from "../../../types";
import db from "../../../db";
import { depositos, ubicaciones } from "../../../db/schema";
import { normalizadorUUID } from "../../../utils/normalizadorUUID";

// POST: Crear un nuevo depósito
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return createResponse(401, "No autenticado");
  }

  try {
    const body = await request.json();
    const {
      nombre,
      descripcion,
      direccion,
      telefono,
      email,
      encargado,
      capacidadTotal,
    } = body;
    const empresaId = locals.user.empresaId;
    const capacidadTotalInt = parseInt(capacidadTotal, 10);
    console.log("datos entrante ->", body);
    if (!nombre || !empresaId) {
      return createResponse(400, "El nombre del depósito es obligatorio.");
    }

    const nombreLowerCase = nombre.toLowerCase();
    const isDepositoExistente = await db
      .select()
      .from(depositos)
      .where(
        and(
          eq(depositos.nombre, nombreLowerCase),
          eq(depositos.empresaId, empresaId)
        )
      );
    console.log("isDepositoExistente", isDepositoExistente);
    if (isDepositoExistente.length > 0) {
      return createResponse(409, "Ya existe un depósito con ese nombre.");
    }

    // --- VALIDACIÓN DE LÍMITES POR PLAN ---
    const { empresas, planes } = await import("../../../db/schema");
    const { sql } = await import("drizzle-orm");

    const [empresaData] = await db
      .select({
        planId: empresas.planId,
        cantidadSucursales: empresas.cantidadSucursales,
      })
      .from(empresas)
      .where(eq(empresas.id, empresaId));

    if (empresaData?.planId) {
      const [planData] = await db
        .select({
          limiteSucursales: planes.limiteSucursales,
          nombre: planes.nombre,
        })
        .from(planes)
        .where(eq(planes.id, empresaData.planId));

      if (planData && empresaData.cantidadSucursales >= planData.limiteSucursales) {
        return createResponse(
          403,
          `Límite de sucursales alcanzado (${planData.limiteSucursales}) para tu ${planData.nombre}. Por favor, actualiza tu plan.`
        );
      }
    }
    // ---------------------------------------

    const [newDeposito] = await db.transaction(async (tx) => {
      // 1. Crear depósito
      const [res] = await tx
        .insert(depositos)
        .values({
          id: normalizadorUUID("dep-", 15),
          nombre: nombreLowerCase,
          descripcion,
          direccion,
          telefono,
          email,
          encargado,
          capacidadTotal: capacidadTotalInt,
          creadoPor: locals.user.id,
          empresaId,
        })
        .returning();

      // 2. Actualizar contador en Empresa
      await tx
        .update(empresas)
        .set({
          cantidadSucursales: sql`${empresas.cantidadSucursales} + 1`,
        })
        .where(eq(empresas.id, empresaId));

      return [res];
    });

    return createResponse(201, "Depósito creado exitosamente", newDeposito);
  } catch (error) {
    console.error("Error al crear depósito:", error);
    return createResponse(
      500,
      "Error interno del servidor al crear el depósito."
    );
  }
};

// GET: Obtener todos los depósitos de la empresa
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const { user } = locals;
    const empresaId = user?.empresaId;

    if (!empresaId) {
      return createResponse(400, "ID de empresa requerido o usuario no autenticado");
    }

    const depositosDB = await db
      .select()
      .from(depositos)
      .where(eq(depositos.empresaId, empresaId));

    if (depositosDB.length === 0) {
      return createResponse(205, "No se encontraron depósitos", []);
    }

    return createResponse(200, "Depósitos encontrados", depositosDB);
  } catch (error) {
    console.error("Error al buscar depósitos:", error);
    return createResponse(500, "Error crítico al buscar depósitos");
  }
};

// PUT: Actualizar un depósito existente
export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return createResponse(401, "No autenticado");
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return createResponse(
        400,
        "Se requiere el ID del depósito para actualizar."
      );
    }

    // Asegurarse de que el depósito pertenece a la empresa del usuario
    const existingDepot = await db
      .select()
      .from(depositos)
      .where(
        and(
          eq(depositos.id, id),
          eq(depositos.empresaId, locals.user.empresaId)
        )
      );
    if (existingDepot.length === 0) {
      return createResponse(
        404,
        "Depósito no encontrado o no tienes permiso para editarlo."
      );
    }

    if (updateData.nombre) {
      updateData.nombre = updateData.nombre.toLowerCase();
    }

    const updatedDepot = await db
      .update(depositos)
      .set(updateData)
      .where(eq(depositos.id, id))
      .returning();

    return createResponse(
      200,
      "Depósito actualizado correctamente",
      updatedDepot[0]
    );
  } catch (error) {
    console.error("Error al actualizar depósito:", error);
    return createResponse(500, "Error interno del servidor al actualizar.");
  }
};

// DELETE: Eliminar un depósito
export const DELETE: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return createResponse(401, "No autenticado");
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return createResponse(
        400,
        "Se requiere el ID del depósito para eliminar."
      );
    }

    // Verificar que el depósito pertenece a la empresa
    const existingDepot = await db
      .select()
      .from(depositos)
      .where(
        and(
          eq(depositos.id, id),
          eq(depositos.empresaId, locals.user.empresaId)
        )
      );
    if (existingDepot.length === 0) {
      return createResponse(404, "Depósito no encontrado o sin permisos.");
    }

    // **Importante: Verificar si el depósito tiene ubicaciones asociadas**
    const locationsCount = await db
      .select({ value: count() })
      .from(ubicaciones)
      .where(eq(ubicaciones.depositoId, id));
    if (locationsCount[0].value > 0) {
      return createResponse(
        409,
        `No se puede eliminar. El depósito tiene ${locationsCount[0].value} ubicaciones asociadas.`
      );
    }

    const { empresas } = await import("../../../db/schema");
    const { sql } = await import("drizzle-orm");

    await db.transaction(async (tx) => {
      // 1. Eliminar depósito
      await tx.delete(depositos).where(eq(depositos.id, id));

      // 2. Decrementar contador en Empresa
      await tx
        .update(empresas)
        .set({
          cantidadSucursales: sql`${empresas.cantidadSucursales} - 1`,
        })
        .where(eq(empresas.id, locals.user.empresaId));
    });

    console.log("Depósito eliminado correctamente");
    return createResponse(200, "Depósito eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar depósito:", error);
    return createResponse(500, "Error interno del servidor al eliminar.");
  }
};
