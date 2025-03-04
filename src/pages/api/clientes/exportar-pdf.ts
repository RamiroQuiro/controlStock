import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { db } from '../../../db';
import { clientes } from '../../../db/schema/clientes';
import { generarTemplateClientes } from '../../../services/pdf-templates/clientesTemplate';

export const get: APIRoute = async () => {
  try {
    const clientesData = await db.query.clientes.findMany({
      orderBy: (clientes, { desc }) => [desc(clientes.fechaAlta)]
    });

    // Generar HTML usando la plantilla
    const html = generarTemplateClientes(clientesData);

    // Iniciar Puppeteer y generar PDF
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true // Para mantener los colores de fondo
    });

    await browser.close();

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=clientes-${new Date().toISOString().split('T')[0]}.pdf`
      }
    });

  } catch (error) {
    console.error('Error al exportar PDF:', error);
    return new Response(
      JSON.stringify({ message: 'Error al exportar PDF' }), 
      { status: 500 }
    );
  }
}; 