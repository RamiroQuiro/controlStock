import type { APIContext } from "astro";
import { roles } from "../../../db/schema/roles";
import { generateId } from "lucia";
import db from "../../../db";
import { eq } from "drizzle-orm";



  

export async function POST({ request, locals }: APIContext) {
  const { nombre, descripcion, permisos, inicializar } = await request.json();
  const userId = locals.user?.id;
  // Validar que solo admins puedan crear o inicializar roles
  if (locals.user?.rol !== 'admin') {
    return new Response(
      JSON.stringify({
        message: 'No tienes permisos para crear o inicializar roles',
        status: 403
      }),
      { status: 403 }
    );
  }

  try {
 
    // Lógica para crear un rol individual
    const [nuevoRol] = await db.insert(roles).values({
      id: generateId(10),
      nombre,
      descripcion,
      permisos: JSON.stringify(permisos || []),
      creadoPor: userId
    }).returning();

    return new Response(
      JSON.stringify({
        rol: nuevoRol,
        status: 201,
        message: 'Rol creado exitosamente'
      }), 
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Error al crear rol',
        error: error.message,
        status: 500
      }), 
      { status: 500 }
    );
  }
}
