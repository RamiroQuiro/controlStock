import type { APIRoute } from "astro";
import { ComprobanteService } from "../../../services/comprobante.service";
import { traerVentaId } from "../../../services/ventastodas.service";
import { createResponse } from "../../../types";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ventaId } = await request.json();

    if (!ventaId) {
      return createResponse(400, "Falta el ID de la venta", null);
    }

    // 1. Obtener los datos completos de la venta
    const dataVenta = await traerVentaId(ventaId);

    if (!dataVenta) {
      return createResponse(404, "Venta no encontrada", null);
    }

    // 2. Generar el HTML del ticket
    const comprobanteService = new ComprobanteService();
    const html = await comprobanteService.generarTicketHTML(dataVenta);

    // 3. Devolver el HTML
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generando el ticket:", error);
    return createResponse(500, "Error interno del servidor", null);
  }
};
