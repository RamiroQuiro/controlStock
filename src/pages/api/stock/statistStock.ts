import type { APIRoute } from 'astro';
import { obtenerDatosStock } from '../../../utils/stockFuncional2';
import { createResponse } from '../../../types';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const userId = request.headers.get('x-user-id');
    const empresaId = request.headers.get('xx-empresa-id');
    console.log('datos del encabezado ->', userId, empresaId);
    if (!userId || !empresaId) { // Asegurarse que empresaId también exista
      return new Response(JSON.stringify({ error: 'Usuario o empresa no autorizados' }), {
        status: 401,
      });
    }

    const data = await obtenerDatosStock(empresaId, page, limit);
    return createResponse(200, 'datos obtenidos exitosamente', data);
  } catch (error) {
    return createResponse(500, 'Error interno del servidor', error);
  }
};
