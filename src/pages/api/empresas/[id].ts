import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import db from '../../../db';
import { empresas } from '../../../db/schema';

export const GET: APIRoute = async ({ params, locals }) => {
  const { user } = locals;
  const empresaId = params.id;

  // Verificación de seguridad: El usuario solo puede solicitar su propia empresa
  if (!user || user.empresaId !== empresaId) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const [empresaData] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, empresaId));

    if (!empresaData) {
      return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(empresaData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error obteniendo datos de la empresa:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
