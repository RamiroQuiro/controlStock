import type { APIRoute } from 'astro';
import {ComprasServices} from '../../../services/compras.services';
const { traerCompraId } = new ComprasServices();

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const compraId = params.compraId as string;
    const userId = request.headers.get('x-user-id'); // Obtener el userId del encabezado

    console.log('data que llega al enpoint ->',compraId,userId)
    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'User ID es requerido' }),
        { status: 400 }
      );
    }

    const compra = await traerCompraId(compraId,userId);
    if (!compra) {
      return new Response(
        JSON.stringify({ message: 'compra no encontrada' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Venta obtenida exitosamente', data: compra }),
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
  