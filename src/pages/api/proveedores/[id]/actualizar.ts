import type { APIRoute } from "astro";
import { proveedores } from "../../../../db/schema/proveedores";
import { eq } from "drizzle-orm";
import db from "../../../../db";

export const PUT: APIRoute = async ({ params, request }) => {
  const proveedorId = params.id;

  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id'); // Asumiendo que tienes el userId en headers




    // Actualizar cliente
    const [clienteActualizado] = await db
      .update(proveedores)
      .set({
        nombre: body.nombre,
        dni: body.dni,
        celular: body.celular || null,
        email: body.email || null,
        direccion: body.direccion || null,
        estado: body.estado,
        observaciones: body.observaciones || null,
      })
      .where(eq(proveedores.id, proveedorId))
      .returning();

    return new Response(
      JSON.stringify({
        message: 'Cliente actualizado exitosamente',
        data: clienteActualizado
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error al actualizar el cliente' 
      }), 
      { status: 500 }
    );
  }
};
