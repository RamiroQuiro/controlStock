import type { APIRoute } from 'astro';
import { ComprobanteService } from '../../../services/comprobante.service';
import { traerVentaId } from '../../../services/ventastodas.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ventaId } = await request.json();

    if (!ventaId) {
      return new Response('Falta el ID de la venta', { status: 400 });
    }

    // 1. Obtener los datos completos de la venta
    const dataVenta = await traerVentaId(ventaId);

    if (!dataVenta) {
      return new Response('Venta no encontrada', { status: 404 });
    }

    // 2. Generar el HTML del ticket
    const comprobanteService = new ComprobanteService();
    const html = await comprobanteService.generarTicketHTML(dataVenta);

    // 3. Devolver el HTML
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error generando el ticket:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
};