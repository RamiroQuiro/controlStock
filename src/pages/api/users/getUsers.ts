import type { APIRoute } from 'astro';
import db from '../../../db';
import { users, roles } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const userId = request.headers.get('xx-user-id');
  const getUser = url.searchParams.get('getUsers') || '';
  if (getUser) {
    const [userDB] = await db
      .select({
        id: users.id,
        userName: users.userName,
        nombre: users.nombre,
        apellido: users.apellido,
        email: users.email,
        documento: users.documento,
        srcPhoto: users.srcPhoto,
        telefono: users.telefono,
        fechaAlta: users.fechaAlta,
        tipoUsuario: users.tipoUsuario,
        rol: users.rol,
        direccion: users.direccion,
      })
      .from(users)
      .where(eq(users.id, getUser));
    return new Response(
      JSON.stringify({
        status: 200,
        data: userDB,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  try {
    const userDB = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        apellido: users.apellido,
        srcPhoto: users.srcPhoto,
        documento: users.documento,
        activo: users.activo,
        email: users.email,
        rol: users.rol,
      })
      .from(users)
      .where(eq(users.creadoPor, userId));
    const rolesDB = await db
      .select()
      .from(roles)
      .where(eq(roles.creadoPor, userId));
    return new Response(
      JSON.stringify({
        status: 200,
        data: { userDB, rolesDB },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Manejo de errores durante la transacción o consultas
    console.error('Error al obtener los datos del producto:', error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: 'Error al buscar los datos del producto',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
