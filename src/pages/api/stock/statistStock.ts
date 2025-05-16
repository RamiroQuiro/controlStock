import type { APIRoute } from 'astro';
import { trayendoProductos } from '../../../utils/stockFunctions';

export const GET: APIRoute = async ({ request }) => {
  try {
    const userId = request.headers.get('x-user-id');
    const empresaId = request.headers.get('xx-empresa-id');
   
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Usuario no autorizado' }), { 
        status: 401 
      });
    }

    const data = await trayendoProductos(empresaId);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { 
      status: 500 
    });
  }
};