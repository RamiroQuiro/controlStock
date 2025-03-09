import type { APIRoute } from "astro";
import db from "../../../db";
import { proveedores } from "../../../db/schema";
import { like, or } from "drizzle-orm";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("search");
  console.log("¿Qué proveedor buscamos?", query);

  try {
    const resultados = await db
      .select({
        id: proveedores.id,
        nombre: proveedores.nombre,
        celular: proveedores.celular,
        email: proveedores.email,
        dni:proveedores.dni,
        direccion: proveedores.direccion,
      })
      .from(proveedores)
      .where(
        or(
          like(proveedores.id, `%${query}%`),
          like(proveedores.dni, `%${query}%`),
          like(proveedores.nombre, `%${query}%`),
        )
      );

    console.log('resultados ->', resultados);
    
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
        error: error instanceof Error ? error.message : "Error desconocido"
      })
    );
  }
};