import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { ComprobanteService } from '../../../services/comprobante.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Iniciar Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    const page = await browser.newPage();
    
    // Generar HTML usando el servicio
    const comprobanteService = new ComprobanteService();
    const html = await comprobanteService.generarTicketHTML(data);

    // Cargar HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generar PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      printBackground: true
    });

    await browser.close();

    // Devolver el PDF
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=comprobante-${data.codigo}.pdf`
      }
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    return new Response(JSON.stringify({ error: 'Error generando PDF' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 