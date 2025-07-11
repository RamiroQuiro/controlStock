import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import db from '../../../db';
import { empresas } from '../../../db/schema';

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  if (!user || !user.empresaId) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();

    // Validación básica de datos (puedes expandirla según necesites)
    if (!data.razonSocial || !data.documento) {
      return new Response(JSON.stringify({ error: 'Razón Social y Documento son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [updatedEmpresa] = await db
      .update(empresas)
      .set({
        razonSocial: data.razonSocial,
        documento: data.documento,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        srcPhoto: data.logoUrl, // Asumiendo que el logo se guarda como una URL o base64
        colorAsset: data.colorAsset, // El nuevo campo para el color de marca
      })
      .where(eq(empresas.id, user.empresaId))
      .returning();

    if (!updatedEmpresa) {
      return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(updatedEmpresa), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error actualizando la empresa:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
