import type { APIRoute } from "astro";
import db from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const userId = request.headers.get("xx-user-id");
  try {
    const userDB = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        apellido: users.apellido,
        email: users.email,
        rol: users.rol,
      })
      .from(users)
      .where(eq(users.creadoPor, userId));
    return new Response(
      JSON.stringify({
        status: 200,
        data: userDB,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Manejo de errores durante la transacción o consultas
    console.error("Error al obtener los datos del producto:", error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "Error al buscar los datos del producto",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
