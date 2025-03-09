import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import db from '../../../db';
import { eq } from 'drizzle-orm';
import { proveedores } from '../../../db/schema';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id'); // Asumiendo que tienes el userId en headers
    if (!body.nombre || !body.dni) {
      return new Response(
        JSON.stringify({ 
          message: 'Nombre y DNI son requeridos' 
        }), 
        { status: 400 }
      );
    }

    const proveedorExistente = (await db.select().from(proveedores).where(eq(proveedores.dni,body.dni))).at(0)

    if (proveedorExistente) {
      return new Response(
        JSON.stringify({ 
          msg: 'Ya existe un proveedor con ese DNI' 
        }), 
        { status: 400,statusText:'Ya existe un proveedor con ese DNI' }
      );
    }

    const nuevoProveedor = await db.insert(proveedores).values({
      id: nanoid(),
      userId,
      nombre: body.nombre,
      dni:Number(body.dni),
      celular: body.celular || null,
      email: body.email || null,
      direccion: body.direccion || null,
      observaciones: body.observaciones || null,
      estado: 'activo',
      created_at: Math.floor(Date.now() / 1000), // Timestamp en segundos
    }).returning();

    return new Response(
      JSON.stringify({
        message: 'Proveedor creado exitosamente',
        data: nuevoProveedor[0],
        status: 200
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error interno del servidor' 
      }), 
      { status: 500 }
    );
  }
}; 