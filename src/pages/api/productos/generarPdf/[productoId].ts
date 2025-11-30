// src/pages/api/productos/generarPdf/[productoId].ts
import type { APIRoute } from "astro";
import puppeteer from "puppeteer";
import { eq } from "drizzle-orm";
import db from "../../../../db";
import {
  depositos,
  productos,
  stockActual,
  ubicaciones,
} from "../../../../db/schema";
import { generarTemplateProductos } from "../../../../services/pdf-templates/perfilProductos";

export const GET: APIRoute = async ({ url, request, params, locals }) => {
  const { productoId } = params;
  const { user, session } = locals;

  const userId = user?.id;
  // Validación más robusta del ID del producto
  if (!productoId) {
    return new Response(
      JSON.stringify({ error: "ID de producto es requerido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Intentar convertir a número, con manejo de error

  try {
    // Obtener datos del producto con manejo de caso no encontrado
    const productosResult = await db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        codigoBarra: productos.codigoBarra,
        descripcion: productos.descripcion,
        categoria: productos.categoria,
        marca: productos.marca,
        modelo: productos.modelo,
        precioCompra: productos.pCompra,
        precioVenta: productos.pVenta,
        srcPhoto: productos.srcPhoto,
        iva: productos.iva,
      })
      .from(productos)
      .where(eq(productos.id, productoId));

    // Verificar si se encontró el producto
    if (productosResult.length === 0) {
      return new Response(JSON.stringify({ error: "Producto no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const producto = productosResult[0];
    console.log("src photos ->", producto.srcPhoto);
    // Obtener datos de stock con manejo de caso no encontrado
    const stockResult = await db
      .select({
        cantidad: stockActual.cantidad,
        deposito: depositos.nombre,
        ubicaciones: ubicaciones.nombre,
        alertaStock: stockActual.alertaStock,
      })
      .from(stockActual)
      .innerJoin(depositos, eq(stockActual.depositosId, depositos.id))
      .innerJoin(ubicaciones, eq(stockActual.ubicacionesId, ubicaciones.id))
      .where(eq(stockActual.productoId, productoId));

    // Valores por defecto si no se encuentra stock
    const stock =
      stockResult.length > 0
        ? stockResult[0]
        : {
            cantidad: 0,
            deposito: "N/A",
            ubicaciones: "N/A",
            alertaStock: 0,
          };

    // Iniciar Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
    });
    const page = await browser.newPage();

    // HTML para el PDF con manejo de valores nulos
    const htmlContent = generarTemplateProductos(producto, stock);

    // Cargar HTML
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Generar PDF
    const pdf = await page.pdf({
      format: "A4",
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      printBackground: true,
    });

    await browser.close();

    // Devolver el PDF
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=producto_${productoId}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return new Response(
      JSON.stringify({
        error: "Error generando PDF",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
