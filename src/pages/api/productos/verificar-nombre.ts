// pages/api/productos/verificar-nombre.ts
import type { APIRoute } from "astro";
import { and, eq, or, like, sql } from "drizzle-orm";
import db from "../../../db";
import { productos } from "../../../db/schema";


export const GET: APIRoute = async ({ request,locals }) => {
  try {
    const url = new URL(request.url);
    const nombre = url.searchParams.get('nombre')?.trim();
    const empresaId = locals.user?.empresaId;
    const excluirId = url.searchParams.get('excluirId'); // 🎯 Para edición

    if (!nombre || !empresaId) {
      return new Response(
        JSON.stringify({ 
          existe: false,
          error: 'Nombre y empresaId son requeridos' 
        }), 
        { status: 400 }
      );
    }

    // 🎯 BUSCAR PRODUCTOS CON NOMBRE SIMILAR (case-insensitive)
    const condiciones = [
      and(
        eq(productos.empresaId, empresaId),
        // 🎯 Búsqueda case-insensitive (SQLite no tiene ILIKE, usamos LIKE con lower)
        like(sql`lower(${productos.nombre})`, `%${nombre.toLowerCase()}%`)
      )
    ];

    // 🎯 EXCLUIR UN ID ESPECÍFICO (para edición)
    if (excluirId) {
      condiciones.push(eq(productos.id, excluirId));
    }

    const productosExistentes = await db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        codigoBarra: productos.codigoBarra,
        activo: productos.activo
      })
      .from(productos)
      .where(and(...condiciones))
      .limit(5); // 🎯 Devolver varios para mostrar coincidencias

    const existe = productosExistentes.length > 0;

    return new Response(
      JSON.stringify({ 
        existe,
        productos: productosExistentes,
        cantidad: productosExistentes.length,
        mensaje: existe 
          ? `Existen ${productosExistentes.length} productos con nombre similar` 
          : 'Nombre disponible'
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verificando nombre:', error);
    return new Response(
      JSON.stringify({ 
        existe: false,
        error: 'Error interno del servidor'
      }), 
      { status: 500 }
    );
  }
};