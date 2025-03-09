import type { APIRoute } from "astro";
import { clientes } from "../../../../db/schema/clientes";
import { eq } from "drizzle-orm";
import db from "../../../../db";

export const PUT: APIRoute = async ({ params, request }) => {
  const clienteId = params.id;
try {
    const body = await request.json();
    console.log(body)
    const userId = request.headers.get('x-user-id'); // Asumiendo que tienes el userId en headers

 
    // Actualizar cliente
    const [clienteActualizado] = await db
      .update(clientes)
      .set({
        nombre: body.nombre,
        dni: body.dni,
        telefono: body.telefono || null,
        email: body.email || null,
        direccion: body.direccion || null,
        categoria: body.categoria,
        estado: body.estado,
        limiteCredito: body.limiteCredito,
        observaciones: body.observaciones || null,
      })
      .where(eq(clientes.id, clienteId))
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
