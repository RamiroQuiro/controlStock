import type { APIContext } from "astro";
import { roles } from "../../../db/schema/roles";
import { eq } from "drizzle-orm";
import db from "../../../db";

export async function GET({ locals }: APIContext): Promise<Response> {
  const user = locals.user;

  if (!user) {
    return new Response(
      JSON.stringify({
        message: "No autorizado",
        status: 401,
      }),
      { status: 401 }
    );
  }

  try {
    // Obtener roles de la empresa del usuario
    const rolesDB = await db
      .select()
      .from(roles)
      .where(eq(roles.empresaId, user.empresaId));

    return new Response(
      JSON.stringify({
        data: rolesDB,
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return new Response(
      JSON.stringify({
        message: "Error al obtener roles",
        status: 500,
      }),
      { status: 500 }
    );
  }
}
