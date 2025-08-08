import type { APIRoute } from 'astro';
import { obtenerDatosStock } from '../../../utils/stockFuncional2';
import { createResponse } from '../../../types';

export const GET: APIRoute = async ({ request }) => {
  try {
    const userId = request.headers.get('x-user-id');
    const empresaId = request.headers.get('xx-empresa-id');
    console.log('datos del encabezado ->', userId, empresaId);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Usuario no autorizado' }), {
        status: 401,
      });
    }

    const data = await obtenerDatosStock(empresaId);
    return createResponse(200, 'datos obtenidos exitosamente', data);
  } catch (error) {
    return createResponse(500, 'Error interno del servidor', error);
  }
};
