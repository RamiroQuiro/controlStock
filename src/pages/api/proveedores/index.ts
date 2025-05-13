import type { APIContext, APIRoute } from 'astro';
import db from '../../../db';
import { clientes, proveedores } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  const empresaId = request.headers.get('xx-empresa-id');

  try {
    const queryDb = await db
      .select()
      .from(proveedores)
      .where(eq(proveedores.empresaId, empresaId));
    return new Response(
      JSON.stringify({
        msg: 'datos enviados',
        data: queryDb,
        status: 200,
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        msg: 'error al buscar clientes',
        status: 400,
      })
    );
  }
};
