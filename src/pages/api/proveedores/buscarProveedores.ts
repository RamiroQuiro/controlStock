import type { APIRoute } from "astro";
import db from "../../../db";
import { proveedores } from "../../../db/schema";
import { and, eq, like, or } from "drizzle-orm";
import { lucia } from "../../../lib/auth";

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("search")
  // console.log("¿Qué proveedor buscamos?", query);

    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response("No autorizado", { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response("No autorizado", { status: 401 });
    }

  try {
    const resultados = await db
      .select({
        id: proveedores.id,
        nombre: proveedores.nombre,
        celular: proveedores.celular,
        email: proveedores.email,
        dni: proveedores.dni,
        direccion: proveedores.direccion,
      })
      .from(proveedores)
      .where(
        and(
          eq(proveedores.userId, user?.id),
          or(
            like(proveedores.id, `%${query}%`),
            like(proveedores.dni, `%${query}%`),
            like(proveedores.nombre, `%${query}%`)
          )
        )
      );

    // console.log('resultados ->', resultados);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Búsqueda de proveedores exitosa",
        data: resultados,
      })
    );
  } catch (error) {
    console.error("Error en búsqueda de proveedores:", error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "Error al buscar proveedores",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    );
  }
};
