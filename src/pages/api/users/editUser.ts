import type { APIContext } from 'astro';
import { users } from '../../../db/schema';
import { and, eq, or } from 'drizzle-orm';
import { generateId } from 'lucia';
import bcrypt from 'bcryptjs';
import db from '../../../db';
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
    creadoPor,
    activo,
    suspender,
  } = formData;

  if (user?.rol !== 'admin') {
    return new Response(
      JSON.stringify({
        data: 'No tienes permisos para actualizar usuarios',
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
      JSON.stringify({ data: 'Usuario no encontrado', status: 404 })
    );
  }
  if (suspender) {
    if (id == user?.id) {
      return new Response(
        JSON.stringify({ data: 'No puedes eliminar a ti mismo', status: 400 })
      );
    }

    await db.update(users).set({ activo: activo }).where(eq(users.id, id));
    return new Response(
      JSON.stringify({ data: 'Usuario desactivado con éxito', status: 200 })
    );
  }

  if (!id || !email || !dni || !nombre || !apellido) {
    return new Response(
      JSON.stringify({ data: 'Faltan campos requeridos', status: 400 })
    );
  }

  if (password && password.length < 6) {
    return new Response(
      JSON.stringify({
        data: 'Contraseña debe tener al menos 6 caracteres',
        status: 400,
      })
    );
  }

  const updateData: Partial<typeof users.$inferInsert> = {
    documento: dni,
    nombre,
    apellido,
    email,
    rol: rol || 'admin',
    creadoPor,
    userName: `${rol || 'admin'}: ${nombre.toLowerCase()} ${apellido.toLowerCase()} de ${user.userName}`,
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const updatedUser = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning()
    .then((res) => res[0]);

  if (!updatedUser) {
    return new Response(
      JSON.stringify({ data: 'Error al actualizar el usuario', status: 500 })
    );
  }

  return new Response(
    JSON.stringify({ data: 'Usuario actualizado con éxito', status: 200 })
  );
}

export async function DELETE({
  request,
  locals,
}: APIContext): Promise<Response> {
  const { id } = await request.json();
  const { user } = locals;
  if (!id) {
    return new Response(
      JSON.stringify({ data: 'ID de usuario requerido', status: 400 })
    );
  }
  if (id == user?.id) {
    return new Response(
      JSON.stringify({ data: 'No puedes eliminar a ti mismo', status: 400 })
    );
  }

  const [userExist] = await db.select().from(users).where(eq(users.id, id));

  if (!userExist) {
    return new Response(
      JSON.stringify({ data: 'Usuario no encontrado', status: 404 })
    );
  }

  // Verificar permisos del usuario que intenta eliminar

  if (user?.rol !== 'admin' && user.id == userExist.creadoPor) {
    return new Response(
      JSON.stringify({
        data: 'No tienes permisos para eliminar usuarios',
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
      JSON.stringify({ data: 'Error al eliminar el usuario', status: 500 })
    );
  }

  return new Response(
    JSON.stringify({ data: 'Usuario eliminado con éxito', status: 200 })
  );
}
