import type { APIRoute } from "astro";

import { like, eq, or, sql, and } from "drizzle-orm";
import db from "../../../db";
import {
  productos,
  productosFts,
  proveedores,
  stockActual,
} from "../../../db/schema";

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("search")?.trim() || "";
  const { user } = locals;
  const userId = user?.id;
  const empresaId = user?.empresaId;

  if (!empresaId) {
    return new Response(JSON.stringify({ error: "Falta empresaId" }), {
      status: 400,
    });
  }

  if (!query) {
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  }

  try {
    let resultados: any[] = [];

    // Estructura de selección común para asegurar consistencia
    const camposSeleccion = {
      id: productos.id,
      nombre: productos.nombre,
      descripcion: productos.descripcion,
      codigoBarra: productos.codigoBarra,
      marca: productos.marca,
      categoria: productos.categoria,
      pVenta: productos.pVenta,
      srcPhoto: productos.srcPhoto,
      empresaId: productos.empresaId,
      // Seleccionamos campos específicos de stock para evitar problemas de anidamiento
      stockCantidad: stockActual.cantidad,
      stockAlerta: stockActual.alertaStock,
    };

    // 🔵 1 — FTS si query > 2 chars
    if (query.length > 2) {
      resultados = await db
        .select(camposSeleccion)
        .from(productosFts)
        .innerJoin(productos, eq(productosFts.id, productos.id))
        .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
        .where(
          and(
            sql`productos_fts MATCH ${query + "*"}`,
            eq(productos.empresaId, empresaId)
          )
        )
        .orderBy(sql`rank`)
        .limit(20);
    }

    // 🔵 2 — Fallback a LIKE si no hay resultados FTS o query corta
    if (resultados.length === 0) {
      resultados = await db
        .select(camposSeleccion)
        .from(productos)
        .leftJoin(stockActual, eq(productos.id, stockActual.productoId))
        .where(
          and(
            eq(productos.empresaId, empresaId),
            or(
              like(productos.nombre, `%${query}%`),
              like(productos.codigoBarra, `%${query}%`)
            )
          )
        )
        .limit(20);
    }

    // Formatear respuesta para el frontend
    const final = resultados.map((p) => ({
      ...p,
      // Reconstruimos el objeto stock como lo espera el frontend (si es necesario)
      stock: {
        cantidad: p.stockCantidad,
        alertaStock: p.stockAlerta,
      },
    }));

    return new Response(JSON.stringify({ data: final }), { status: 200 });
  } catch (error) {
    console.error("ERROR FTS:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
};
