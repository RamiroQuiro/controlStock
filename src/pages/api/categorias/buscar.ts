import { and, eq, like, or, sql } from "drizzle-orm";
import db from "../../../db";
import { categorias } from "../../../db/schema";
import type { APIRoute } from "astro";

// pages/api/categorias/buscar.ts
export const GET: APIRoute = async ({ request,locals }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const empresaId = locals.user?.empresaId;

  if (!empresaId) {
    return new Response(JSON.stringify({ error: "Empresa ID requerido" }), {
      status: 400,
    });
  }

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  }

  try {
    const resultados = await db
      .select({
        id: categorias.id,
        nombre: categorias.nombre,
        descripcion: categorias.descripcion,
        color: categorias.color,
        activo: categorias.activo,
        productoCount: sql<number>`(
          SELECT COUNT(*) FROM productoCategorias 
          WHERE categoriaId = categorias.id
        )`.as('productoCount')
      })
      .from(categorias)
      .where(
        and(
          eq(categorias.empresaId, empresaId),
          eq(categorias.activo, true),
          or(
            like(categorias.nombre, `%${query}%`),
            like(categorias.descripcion, `%${query}%`)
          )
        )
      )
      .orderBy(
        // 🎯 ORDENAR POR: Coincidencia exacta primero, luego parcial
        sql`
          CASE 
            WHEN categorias.nombre LIKE ${query + '%'} THEN 1
            WHEN categorias.nombre LIKE ${'%' + query + '%'} THEN 2
            ELSE 3
          END,
          categorias.nombre
        `
      )
      .limit(10);

    return new Response(JSON.stringify({ data: resultados }), { status: 200 });

  } catch (error) {
    console.error("Error en búsqueda categorías:", error);
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  }
};