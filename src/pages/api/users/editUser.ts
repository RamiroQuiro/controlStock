import type { APIContext } from "astro";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import db from "../../../db";

export async function PUT({ request, locals }: APIContext): Promise<Response> {
  const formData = await request.json();
  const { user } = locals;
  const {
    id,
    email,
    password,
    dni,
    nombre,
    apellido,
    rol,
    rolPersonalizadoId,
    depositoId,
    creadoPor,
    activo,
    suspender,
  } = formData;

  if (user?.rol !== "admin") {
    return new Response(
      JSON.stringify({
        data: "No tienes permisos para actualizar usuarios",
        status: 403,
      })
    );
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .then((res) => res[0]);

  if (!existingUser) {
    return new Response(
      JSON.stringify({ data: "Usuario no encontrado", status: 404 })
    );
  }

  // Caso especial: solo suspender/activar usuario
  if (suspender) {
    if (id == user?.id) {
      return new Response(
        JSON.stringify({ data: "No puedes eliminar a ti mismo", status: 400 })
      );
    }

    await db.update(users).set({ activo: activo }).where(eq(users.id, id));
    return new Response(
      JSON.stringify({ data: "Usuario desactivado con éxito", status: 200 })
    );
  }

  // Validaciones para actualización completa
  if (!id || !email || !dni || !nombre || !apellido) {
    return new Response(
      JSON.stringify({ data: "Faltan campos requeridos", status: 400 })
    );
  }

  if (password && password.length < 6) {
    return new Response(
      JSON.stringify({
        data: "Contraseña debe tener al menos 6 caracteres",
        status: 400,
      })
    );
  }

  const updateData: Partial<typeof users.$inferInsert> = {
    documento: dni,
    nombre,
    apellido,
    email,
    rol: rol || "admin",
    rolPersonalizadoId: rolPersonalizadoId || null,
    creadoPor,
    userName: `${rol || "admin"}: ${nombre.toLowerCase()} ${apellido.toLowerCase()} de ${user.userName}`,
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  try {
    await db.transaction(async (tx) => {
      // 1. Actualizar usuario
      const [updatedUser] = await tx
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        throw new Error("Error al actualizar el usuario");
      }

      // 2. Actualizar depósito si se envió
      if (depositoId) {
        const { usuariosDepositos } = await import(
          "../../../db/schema/usuariosDepositos"
        );

        // Verificar si ya tiene asignación
        const asignacionExistente = await tx
          .select()
          .from(usuariosDepositos)
          .where(eq(usuariosDepositos.usuarioId, id));

        if (asignacionExistente.length > 0) {
          // Actualizar existente
          await tx
            .update(usuariosDepositos)
            .set({ depositoId })
            .where(eq(usuariosDepositos.usuarioId, id));
        } else {
          // Crear nueva asignación
          await tx.insert(usuariosDepositos).values({
            usuarioId: id,
            depositoId,
          });
        }
      }
    });

    return new Response(
      JSON.stringify({ data: "Usuario actualizado con éxito", status: 200 })
    );
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return new Response(
      JSON.stringify({ data: "Error al actualizar el usuario", status: 500 })
    );
  }
}

export async function DELETE({
  request,
  locals,
}: APIContext): Promise<Response> {
  const { id } = await request.json();
  const { user } = locals;

  if (!id) {
    return new Response(
      JSON.stringify({ data: "ID de usuario requerido", status: 400 })
    );
  }

  if (id == user?.id) {
    return new Response(
      JSON.stringify({ data: "No puedes eliminar a ti mismo", status: 400 })
    );
  }

  const [userExist] = await db.select().from(users).where(eq(users.id, id));

  if (!userExist) {
    return new Response(
      JSON.stringify({ data: "Usuario no encontrado", status: 404 })
    );
  }

  // Verificar permisos del usuario que intenta eliminar
  if (user?.rol !== "admin" && user.id == userExist.creadoPor) {
    return new Response(
      JSON.stringify({
        data: "No tienes permisos para eliminar usuarios",
        status: 403,
      })
    );
  }

  const [deletedUser] = await db
    .update(users)
    .set({ activo: 0 })
    .where(eq(users.id, id))
    .returning();

  if (!deletedUser) {
    return new Response(
      JSON.stringify({ data: "Error al eliminar el usuario", status: 500 })
    );
  }

  return new Response(
    JSON.stringify({ data: "Usuario eliminado con éxito", status: 200 })
  );
}
