import type { APIRoute } from "astro";
import { and, eq, like } from "drizzle-orm";
import db from "../../../db";
import { ubicaciones } from "../../../db/schema";
import { generateId } from "lucia";
import { createResponse } from "../../../types";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return createResponse(401, "No autenticado");
    }

    const { nombre, descripcion, depositoId, zona, capacidad,pasillo,estante,rack,nivel} = await request.json();
    const empresaId = locals.user.empresaId;

    const nombreLowerCase = nombre.toLowerCase();

    const isUbicacionExistente = await db
      .select()
      .from(ubicaciones)
      .where(and(eq(ubicaciones.nombre, nombreLowerCase), eq(ubicaciones.empresaId, empresaId)))
      .limit(1);

    if(isUbicacionExistente.length>0){
      return createResponse(400, "Ubicación ya existe");
    }

    if (!nombre || !empresaId) {
      return createResponse(400, "Nombre y empresaId son requeridos");
    }

    const ubicacion = await db
      .insert(ubicaciones)
      .values({
        id: generateId(10),
        nombre: nombreLowerCase,
        descripcion,
        creadoPor: locals.user.id,
        empresaId,
        depositoId,
        zona,
        capacidad,
        pasillo,
        estante,
        rack,
        nivel,
      })
      .returning();

    return createResponse(200, "Ubicación agregada", ubicacion);
  } catch (error) {
    console.error("Error al agregar ubicación:", error);
    return createResponse(500, "Error al agregar ubicación");
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("search")?.toLowerCase();
    const empresaId = request.headers.get("xx-empresa-id");
    const isAll = url.searchParams.get("all");

    if (!empresaId) {
      return createResponse(400, "ID de empresa requerido");
    }

    let whereCondition = eq(ubicaciones.empresaId, empresaId);

    if (isAll) {
      const ubicacionesDB = await db
        .select()
        .from(ubicaciones)
        .where(whereCondition);

      return createResponse(200, "Ubicaciones encontradas", ubicacionesDB);
    }

    if (query) {
      whereCondition = and(
        whereCondition,
        like(ubicaciones.nombre, `%${query}%`)
      );
    }

    const ubicacionesDB = await db
      .select()
      .from(ubicaciones)
      .where(whereCondition);

    if (ubicacionesDB.length === 0) {
      return createResponse(205, "No se encontraron ubicaciones", []);
    }

    return createResponse(200, "Ubicaciones encontradas", ubicacionesDB);
  } catch (error) {
    console.error("Error al buscar ubicaciones:", error);
    return createResponse(500, "Error al buscar ubicaciones");
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { id, nombre, descripcion, depositoId, zona, capacidad,pasillo,estante,rack,nivel } = await request.json();
    const empresaId = locals.user?.empresaId;

    if (!locals.user) {
      return createResponse(401, "No autenticado");
    }
    const isUbicacionExistente = await db
      .select()
      .from(ubicaciones)
      .where(eq(ubicaciones.id, id))
      .limit(1);
    if (!isUbicacionExistente) {
      return createResponse(404, "Ubicación no encontrada");
    }

    const ubicacion = await db
      .update(ubicaciones)
      .set({
        nombre: nombre.toLowerCase(),
        descripcion,
        empresaId,
        depositoId,
        zona,
        capacidad,
        pasillo,
        estante,
        rack,
        nivel,
      })
      .where(eq(ubicaciones.id, id))
      .returning();
    return createResponse(200, "Ubicación actualizada", id);
  } catch (error) {
    console.error("Error al actualizar ubicación:", error);
    return createResponse(500, "Error al actualizar ubicación");
  }
};
