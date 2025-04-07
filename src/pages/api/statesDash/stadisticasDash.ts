import type { APIRoute } from 'astro';
import { stadisticasDash } from '../../../services/dashboard.service';


export const GET: APIRoute = async ({ params, request }) => {
  try {
    const userId = request.headers.get('x-user-id'); // Obtener el userId del encabezado
    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'User ID es requerido' }),
        { status: 400 }
      );
    }

    const estadisticas = await stadisticasDash(userId);
    if (!estadisticas) {
      return new Response(
        JSON.stringify({ message: 'error en la lectura, no encontrada' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Venta obtenida exitosamente', data: estadisticas }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
};
  