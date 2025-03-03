import type { APIRoute } from "astro";
import { clientes } from "../../../../db/schema/clientes";
import { eq } from "drizzle-orm";
import db from "../../../../db";

export const PUT: APIRoute = async ({ params, request }) => {
  const clienteId = params.id;
console.log(clienteId)
try {
    const body = await request.json();
    console.log(body)
    const userId = request.headers.get('x-user-id'); // Asumiendo que tienes el userId en headers

    // Verificar si el cliente existe
    const clienteExistente = (await db.select().from(clientes).where(eq(clientes.dni,body.dni))).at(0)


    if (!clienteExistente) {
      return new Response(
        JSON.stringify({ 
          message: 'Cliente no encontrado' 
        }), 
        { status: 404 }
      );
    }

    // Verificar DNI duplicado (solo si se está cambiando el DNI)
    if (body.dni !== clienteExistente.dni) {
      const dniDuplicado = await db.query.clientes.findFirst({
        where: eq(clientes.dni, body.dni)
      });

      if (dniDuplicado) {
        return new Response(
          JSON.stringify({ 
            message: 'Ya existe un cliente con ese DNI' 
          }), 
          { status: 400 }
        );
      }
    }

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
