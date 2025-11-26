import type { APIContext } from "astro";
import { roles } from "../../../db/schema/roles";
import { normalizadorUUID } from "../../../utils/normalizadorUUID";
import db from "../../../db";
import { eq } from "drizzle-orm";

export async function POST({ request, locals }: APIContext) {
  const { nombre, descripcion, permisos } = await request.json();
  const userId = locals.user?.id;

  // Validar que solo admins puedan crear roles
  if (locals.user?.rol !== "admin") {
    return new Response(
      JSON.stringify({
        message: "No tienes permisos para crear roles",
        status: 403,
      }),
      { status: 403 }
    );
  }

  try {
    // Crear rol con prefijo rolCustom-
    const roleId = normalizadorUUID("rolCustom", 10);

    const [nuevoRol] = await db
      .insert(roles)
      .values({
        id: roleId,
        nombre,
        descripcion,
        permisos: JSON.stringify(permisos || []),
        creadoPor: userId,
        empresaId: locals.user?.empresaId,
      })
      .returning();

    return new Response(
      JSON.stringify({
        rol: nuevoRol,
        status: 201,
        message: "Rol creado exitosamente",
      }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error al crear rol",
        error: error.message,
        status: 500,
      }),
      { status: 500 }
    );
  }
}
