import type { APIRoute } from "astro";
import { and, eq, like, or, sql } from "drizzle-orm";
import db from "../../../db";
import { categorias } from "../../../db/schema";
import { generateId } from "lucia";
import { createResponse } from "../../../types";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verificar autenticación primero
    if (!locals.user) {
      return createResponse(401, "No autenticado");
    }

    const { nombre, descripcion, empresaId } = await request.json();

    // Validar datos requeridos
    if (!nombre || !empresaId) {
      return createResponse(400, "Nombre y empresaId son requeridos");
    }

    const categoria = await db
      .insert(categorias)
      .values({
        id: generateId(10),
        nombre,
        descripcion,
        creadoPor: locals.user.id,
        empresaId,
      })
      .returning();

    return createResponse(200, "Categoria agregada", categoria);
  } catch (error) {
    console.error("Error al agregar categoria:", error);
    return createResponse(500, "Error al agregar categoria");
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("search")?.toLowerCase();
    const empresaId = request.headers.get("xx-empresa-id");
    const isAll = url.searchParams.get("all");
    console.log("enpoint .>", isAll);
    if (!empresaId) {
      return createResponse(400, "ID de empresa requerido");
    }

    let whereCondition = eq(categorias.empresaId, empresaId);

    if (isAll) {
      const categoriasDB = await db
        .select()
        .from(categorias)
        .where(whereCondition);

      return createResponse(200, "Categorias encontradas", categoriasDB);
    }

    // Agregar condición de búsqueda solo si hay query
    if (query) {
      whereCondition = and(
        whereCondition,
        like(categorias.nombre, `%${query}%`)
      );
    }

    const categoriasDB = await db
      .select()
      .from(categorias)
      .where(whereCondition);

    if (categoriasDB.length === 0) {
      return createResponse(205, "No se encontraron categorias", []);
    }

    return createResponse(200, "Categorias encontradas", categoriasDB);
  } catch (error) {
    console.error("Error al buscar categorias:", error);
    return createResponse(500, "Error al buscar categorias");
  }
};
