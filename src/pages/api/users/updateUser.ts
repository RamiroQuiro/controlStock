import type { APIRoute } from "astro";
import { users } from "../../../db/schema/users";
import { eq } from "drizzle-orm";
import db from "../../../db";

export const POST: APIRoute = async ({ request }) => {
  const { id, nombre, apellido, email, telefono, direccion } = await request.json();
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta el id de usuario" }), { status: 400 });
  }

  try {
    const [userUpdate]=await db
      .update(users)
      .set({ nombre, apellido, email, telefono, direccion })
      .where(eq(users.id, id)).returning()
    return new Response(
      JSON.stringify({
        status: 200,
        data: {
          id:userUpdate.id,
          nombre:userUpdate.nombre,
          apellido:userUpdate.apellido,
          email:userUpdate.email,
          telefono:userUpdate.telefono,
          direccion:userUpdate.direccion
        },
        msg: "Usuario actualizado",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Manejo de errores durante la transacción o consultas
    console.error("Error al actualizar el usuario:", error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "Error al actualizar el usuario",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};