// pages/api/productos/verificar-codigo.ts
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import db from "../../../db";
import { productos } from "../../../db/schema";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const codigo = url.searchParams.get('codigo')?.trim();
    const empresaId = url.searchParams.get('empresaId');

    if (!codigo || !empresaId) {
      return new Response(
        JSON.stringify({ 
          existe: false,
          error: 'Código y empresaId son requeridos' 
        }), 
        { status: 400 }
      );
    }

    // 🎯 BUSCAR PRODUCTO CON EL MISMO CÓDIGO EN LA MISMA EMPRESA
    const productoExistente = await db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        codigoBarra: productos.codigoBarra,
        activo: productos.activo
      })
      .from(productos)
      .where(
        and(
          eq(productos.codigoBarra, codigo),
          eq(productos.empresaId, empresaId)
        )
      )
      .limit(1);

    const existe = productoExistente.length > 0;
    const producto = productoExistente[0] || null;

    return new Response(
      JSON.stringify({ 
        existe,
        producto,
        mensaje: existe 
          ? `Ya existe un producto con código: ${codigo}` 
          : 'Código disponible'
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verificando código:', error);
    return new Response(
      JSON.stringify({ 
        existe: false,
        error: 'Error interno del servidor'
      }), 
      { status: 500 }
    );
  }
};