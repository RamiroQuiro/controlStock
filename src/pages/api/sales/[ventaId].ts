import type { APIRoute } from 'astro';
import db from '../../../db';
import { clientes, detalleVentas, productos, ventas } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { traerVentaId } from '../../../services/ventastodas.service';


export const GET: APIRoute = async ({ params, request }) => {
  try {
    const ventaId = params.ventaId;
    const userId = request.headers.get('x-user-id'); // Obtener el userId del encabezado

    console.log(ventaId)
    if (!userId) {
      return new Response(
        JSON.stringify({ message: 'User ID es requerido' }),
        { status: 400 }
      );
    }

    const venta = await traerVentaId(ventaId);
    if (!venta) {
      return new Response(
        JSON.stringify({ message: 'Venta no encontrada' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Venta obtenida exitosamente', data: venta }),
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
  