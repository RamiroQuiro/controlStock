import type { APIRoute } from 'astro';
import { and, eq, like, or, sql } from 'drizzle-orm';
import db from '../../../db';
import { categorias } from '../../../db/schema';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('search')?.toLocaleLowerCase();
  const empresaId = request.headers.get('xx-empresa-id');
  try {
    const categoriasDB = await db
      .select()
      .from(categorias)
      .where(
        and(
          eq(categorias.empresaId, empresaId),
          or(like(categorias.nombre, `%${query}%`))
        )
      );

    if (categoriasDB.length === 0) {
      return new Response(
        JSON.stringify({
          status: 205,
          msg: 'No se encontraron categorias',
          data: [],
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Categorias encontradas',
        data: categoriasDB,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error al buscar categorias:', error);
    return new Response(
      JSON.stringify({ status: 500, msg: 'Error al buscar categorias' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
