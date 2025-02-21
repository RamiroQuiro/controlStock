import type { APIRoute } from "astro";
import db from "../../../db";
import { clientes } from "../../../db/schema";
import { like, or } from "drizzle-orm";

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, params }) => {
  // Extraer el `productoId` de los parámetros
  const url = new URL(request.url);
  const query = url.searchParams.get("search");
  console.log("que cliente buscamos?", query);

  try {
    const resultados = await db
    .select({
      id:clientes.id,
      nombre:clientes.nombre,
      dni:clientes.dni,
      celular:clientes.telefono,
      email:clientes.email,
    })
    .from(clientes)
    .where(
      or(
        like(clientes.id, `%${query}%`),
        like(clientes.dni, `%${query}%`),
        like(clientes.nombre, `%${query}%`),
      )
    )
console.log('resultados ->',resultados)
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "buscar cliente",
        data: resultados,
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "error",
      })
    );
  }
};
