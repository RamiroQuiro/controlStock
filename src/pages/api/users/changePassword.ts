import type { APIContext, APIRoute } from "astro";
import { users } from "../../../db/schema/users";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../../../utils/auth";
import db from "../../../db";

export const POST: APIContext = async ({ request }) => {
  const { id, actual, nueva } = await request.json();
  if (!id || !actual || !nueva) {
    return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400 });
  }
console.log(id,actual,nueva)
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    console.log(user)
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });
    }

    // Verifica la contraseña actual
    const ok = await comparePassword(actual, user.password);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Contraseña actual incorrecta" }), { status: 401 });
    }

    // Cambia la contraseña
    const nuevaHash = await hashPassword(nueva);
    await db.update(users).set({ password: nuevaHash }).where(eq(users.id, id));
    return new Response(JSON.stringify({ message: "Contraseña cambiada" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al cambiar contraseña" }), { status: 500 });
  }
};