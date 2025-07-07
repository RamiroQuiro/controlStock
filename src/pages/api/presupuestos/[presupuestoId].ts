import type { APIRoute } from 'astro';
import db from '../../../db';
import { traerPresupuestoId } from '../../../services/presupuestos.service';


export const GET: APIRoute = async ({ params, request }) => {
  try {
    const presupuestoId = params.presupuestoId || '';
    const userId = request.headers.get('x-user-id'); // Obtener el userId del encabezado

    console.log(presupuestoId)
    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'User ID es requerido' }),
        { status: 400 }
      );
    }

    const presupuesto = await traerPresupuestoId(presupuestoId);
    console.log('presupuesto Id ->',presupuesto)
    if (!presupuesto) {
      return new Response(
        JSON.stringify({ message: 'presupuesto no encontrada' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'presupuesto obtenida exitosamente', data: presupuesto }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener la presupuesto:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
};
  