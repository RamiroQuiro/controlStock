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

    const { nombre, descripcion, color } = await request.json();
    const empresaId = locals.user.empresaId;
    console.log("color", color);
    console.log("nombre", nombre);
    console.log("descripcion", descripcion);
    console.log("empresaId", empresaId);

const nombreLowerCase = nombre.toLowerCase();

    const isCategoriaExistente = await db
      .select()
      .from(categorias)
      .where(and(eq(categorias.nombre, nombreLowerCase), eq(categorias.empresaId, empresaId)))
      .limit(1);
      console.log("isCategoriaExistente", isCategoriaExistente);
      console.log('nombreLowerCase', nombreLowerCase);
    if(isCategoriaExistente.length>0){
      return createResponse(400, "Categoria ya existe");
    }
    // Validar datos requeridos
    if (!nombre || !empresaId) {
      return createResponse(400, "Nombre y empresaId son requeridos");
    }

    const categoria = await db
      .insert(categorias)
      .values({
        id: generateId(10),
        nombre: nombreLowerCase,
        descripcion,
        color: color,
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

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { id, nombre, descripcion, color } = await request.json();
    const empresaId = locals.user?.empresaId;
// console.log('esto son los datos de entrada',id,nombre,descripcion,color)
    if (!locals.user) {
      return createResponse(401, "No autenticado");
    }
    const isCategoriaExistente = await db
      .select()
      .from(categorias)
      .where(eq(categorias.id, id))
      .limit(1);
    if (!isCategoriaExistente) {
      return createResponse(404, "Categoria no encontrada");
    }

    const categoria = await db
      .update(categorias)
      .set({
        nombre: nombreLowerCase,
        descripcion,
        color,
        empresaId,
      })
      .where(eq(categorias.id, id))
      .returning();
    return createResponse(200, "Categoria actualizada", id);
  } catch (error) {
    console.error("Error al actualizar categoria:", error);
    return createResponse(500, "Error al actualizar categoria");
  }
};
