import type { APIRoute } from "astro";
import { and, eq, like, or, sql } from "drizzle-orm";
import db from "../../../db";
import { categorias } from "../../../db/schema";
import { generateId } from "lucia";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { nombre, descripcion, empresaId } = await request.json();
    console.log(nombre,descripcion,empresaId)
    const userId = locals.user.id;
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          status: 401,
          msg: "No autenticado",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const categoria = await db
      .insert(categorias)
      .values({
        id: generateId(10),
        nombre,
        descripcion,
        creadoPor: userId,
        empresaId,
      })
      .returning();
    console.log(categoria);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Categoria agregada",
        data: categoria,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al agregar categoria:", error);
    return new Response(
      JSON.stringify({ status: 500, msg: "Error al agregar categoria" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("search")?.toLocaleLowerCase();
  const empresaId = request.headers.get("xx-empresa-id");
  try {
    const categoriasDB = await db
      .select()
      .from(categorias)
      .where(
        and(
          eq(categorias.empresaId, empresaId),
          or(like(categorias.nombre, `%${query}%`))
        )
      );

    if (categoriasDB.length === 0) {
      return new Response(
        JSON.stringify({
          status: 205,
          msg: "No se encontraron categorias",
          data: [],
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Categorias encontradas",
        data: categoriasDB,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al buscar categorias:", error);
    return new Response(
      JSON.stringify({ status: 500, msg: "Error al buscar categorias" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
