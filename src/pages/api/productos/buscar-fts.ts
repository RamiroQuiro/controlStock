import type { APIRoute } from "astro";

import { like, eq, or, sql, and } from "drizzle-orm";
import db from "../../../db";
import {
  productos,
  productosFts,
  proveedores,
  stockActual,
  depositos,
} from "../../../db/schema";

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("search")?.trim() || "";
  const { user } = locals;
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
    // Campos base del producto (sin stock para evitar duplicados por sucursal)
    const camposProducto = {
      id: productos.id,
      nombre: productos.nombre,
      descripcion: productos.descripcion,
      codigoBarra: productos.codigoBarra,
      marca: productos.marca,
      categoria: productos.categoria,
      pVenta: productos.pVenta,
      pCompra: productos.pCompra,
      srcPhoto: productos.srcPhoto,
      empresaId: productos.empresaId,
    };

    let productosResult: any[] = [];

    // 🔵 1 — FTS si query > 2 chars
    if (query.length > 2) {
      productosResult = await db
        .select(camposProducto)
        .from(productosFts)
        .innerJoin(productos, eq(productosFts.id, productos.id))
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
    if (productosResult.length === 0) {
      productosResult = await db
        .select(camposProducto)
        .from(productos)
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

    if (productosResult.length === 0) {
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }

    // 🔵 3 — Obtener stock de TODAS las sucursales de una sola vez
    const productoIdsSet = new Set(productosResult.map((p) => p.id));
    const stockRows = await db
      .select({
        productoId: stockActual.productoId,
        cantidad: stockActual.cantidad,
        alertaStock: stockActual.alertaStock,
        depositoId: stockActual.depositosId,
        depositoNombre: depositos.nombre,
        depositoPrincipal: depositos.principal,
      })
      .from(stockActual)
      .leftJoin(depositos, eq(stockActual.depositosId, depositos.id))
      .where(eq(stockActual.empresaId, empresaId));

    // Agrupar por productoId en memoria
    const stockMap = new Map<string, {
      totalCantidad: number;
      alertaStock: number;
      stockPorDeposito: Array<{ depositoId: string | null; depositoNombre: string | null; cantidad: number; principal: boolean }>;
    }>();

    for (const row of stockRows) {
      if (!productoIdsSet.has(row.productoId)) continue;
      const prev = stockMap.get(row.productoId) ?? {
        totalCantidad: 0,
        alertaStock: row.alertaStock ?? 5,
        stockPorDeposito: [],
      };
      prev.totalCantidad += row.cantidad ?? 0;
      if (row.depositoId) {
        prev.stockPorDeposito.push({
          depositoId: row.depositoId,
          depositoNombre: row.depositoNombre,
          cantidad: row.cantidad ?? 0,
          principal: row.depositoPrincipal ?? false,
        });
      }
      stockMap.set(row.productoId, prev);
    }

    // Combinar resultado final
    const final = productosResult.map((p) => {
      const stockData = stockMap.get(p.id);
      return {
        ...p,
        stock: {
          cantidad: stockData?.totalCantidad ?? 0,
          alertaStock: stockData?.alertaStock ?? 5,
          stockPorDeposito: stockData?.stockPorDeposito ?? [],
        },
      };
    });

    return new Response(JSON.stringify({ data: final }), { status: 200 });
  } catch (error) {
    console.error("ERROR FTS:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
};
