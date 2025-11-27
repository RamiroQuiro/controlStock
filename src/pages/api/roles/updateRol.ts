import type { APIContext } from "astro";
import { roles } from "../../../db/schema/roles";
import db from "../../../db";
import { eq, and } from "drizzle-orm";

export async function PUT({ request, locals }: APIContext) {
  const { id, nombre, descripcion, permisos } = await request.json();
  const userId = locals.user?.id;

  // Validar sesión
  if (!userId) {
    return new Response(
      JSON.stringify({
        message: "No autorizado",
        status: 401,
      }),
      { status: 401 }
    );
  }

  // Validar permisos de admin (o permiso específico de editar roles)
  // Por ahora restringimos a admin para mayor seguridad
  if (locals.user?.rol !== "admin") {
    return new Response(
      JSON.stringify({
        message: "No tienes permisos para editar roles",
        status: 403,
      }),
      { status: 403 }
    );
  }

  if (!id) {
    return new Response(
      JSON.stringify({
        message: "ID de rol requerido",
        status: 400,
      }),
      { status: 400 }
    );
  }

  try {
    // Verificar que el rol pertenezca a la empresa del usuario
    const [rolExistente] = await db
      .select()
      .from(roles)
      .where(
        and(eq(roles.id, id), eq(roles.empresaId, locals.user?.empresaId!))
      );

    if (!rolExistente) {
      return new Response(
        JSON.stringify({
          message: "Rol no encontrado",
          status: 404,
        }),
        { status: 404 }
      );
    }

    // Actualizar rol
    const [rolActualizado] = await db
      .update(roles)
      .set({
        nombre,
        descripcion,
        permisos: JSON.stringify(permisos || []),
      })
      .where(eq(roles.id, id))
      .returning();

    return new Response(
      JSON.stringify({
        rol: rolActualizado,
        status: 200,
        message: "Rol actualizado exitosamente",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    return new Response(
      JSON.stringify({
        message: "Error al actualizar rol",
        error: error instanceof Error ? error.message : "Error desconocido",
        status: 500,
      }),
      { status: 500 }
    );
  }
}
