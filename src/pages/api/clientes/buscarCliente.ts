import type { APIRoute } from 'astro';
import db from '../../../db';
import { clientes } from '../../../db/schema';
import { and, like, or, eq } from 'drizzle-orm';

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Extraer userId del header
    const empresaId = request.headers.get('xx-empresa-id');
    const { user } = locals;
    // Verificar que userId esté presente
    if (!empresaId) {
      return new Response(
        JSON.stringify({
          status: 401,
          msg: 'No se proporcionó un ID de usuario válido',
        }),
        { status: 401 }
      );
    }

    // Extraer parámetros de búsqueda
    const url = new URL(request.url);
    const query = url.searchParams.get('search') || '';

    // Realizar búsqueda con filtros
    const resultados = await db
      .select({
        id: clientes.id,
        nombre: clientes.nombre,
        dni: clientes.dni,
        celular: clientes.telefono,
        email: clientes.email,
      })
      .from(clientes)
      .where(
        and(
          eq(clientes.empresaId, empresaId),
          or(
            query ? like(clientes.id, `%${query}%`) : undefined,
            query ? like(clientes.dni, `%${query}%`) : undefined,
            query ? like(clientes.nombre, `%${query}%`) : undefined
          )
        )
      )
      .limit(50); // Limitar resultados para evitar sobrecarga

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Clientes encontrados',
        data: resultados,
        total: resultados.length,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en búsqueda de clientes:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error interno al buscar clientes',
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
