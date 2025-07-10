import type { APIRoute } from 'astro';
import { iaService } from '../../../services/ia.service';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const { user } = locals;
    if (!user || !user.empresaId) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
      });
    }

    const analisis = await iaService.analizarVentasSemanales(user.empresaId);

    return new Response(JSON.stringify({ analisis }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error en el endpoint de análisis de IA:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
