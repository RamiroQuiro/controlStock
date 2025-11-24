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

    // 🔵 1 — FTS si query > 2 chars
    if (query.length > 2) {
      resultados = await db
        .select({
          id: productos.id,
          nombre: productos.nombre,
          descripcion: productos.descripcion,
          codigoBarra: productos.codigoBarra,
          marca: productos.marca,
          categoria: productos.categoria,
          pVenta: productos.pVenta,
          srcPhoto: productos.srcPhoto,
          stock: stockActual.cantidad,
          alertaStock: stockActual.alertaStock,
        })
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

    if (resultados.length === 0) {
      resultados = await db
        .select({
          producto: productos,
          stock: stockActual,
          proveedor: proveedores,
        })
        .from(productos)
        .leftJoin(stockActual, eq(productos.id, stockActual.productoId))
        .leftJoin(proveedores, eq(productos.proveedorId, proveedores.id))
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

    const ids = resultados.map((p) => p.id);

    const stockRows = await db
      .select()
      .from(stockActual)
      .where(or(...ids.map((id) => eq(stockActual.productoId, id))));

    const stockMap = new Map(stockRows.map((s) => [s.productoId, s]));

    const final = resultados.map((p) => ({
      ...p,
      stock: stockMap.get(p.id) || null,
    }));

    return new Response(JSON.stringify({ data: final }), { status: 200 });
  } catch (error) {
    console.error("ERROR FTS:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
};
