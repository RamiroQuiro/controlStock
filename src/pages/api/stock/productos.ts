import type { APIRoute } from "astro";
import { productos, stockActual, depositos } from "../../../db/schema";
import db from "../../../db";
import { and, count, desc, eq, sql, like, or } from "drizzle-orm";
import { createResponse } from "../../../types";

export const GET: APIRoute = async ({ request, locals }) => {
  const empresaId = locals.user?.empresaId;
  if (!empresaId) return createResponse(401, "No autenticado");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const query = url.searchParams.get("query") || "";

  try {
    const searchCondition = query
      ? or(
          like(productos.nombre, `%${query}%`),
          like(productos.descripcion, `%${query}%`),
          like(productos.marca, `%${query}%`),
          like(productos.codigoBarra, `%${query}%`)
        )
      : undefined;

    const whereCondition = and(
      eq(productos.empresaId, empresaId),
      eq(productos.activo, true),
      searchCondition
    );

    // 1. Obtener productos (sin stock join para evitar duplicados por sucursal)
    const [productosDB, totalResult] = await Promise.all([
      db
        .select({
          id: productos.id,
          nombre: productos.nombre,
          codigoBarra: productos.codigoBarra,
          descripcion: productos.descripcion,
          pCompra: productos.pCompra,
          pVenta: productos.pVenta,
          srcPhoto: productos.srcPhoto,
          categoria: productos.categoria,
          ultimaActualizacion: productos.ultimaActualizacion,
        })
        .from(productos)
        .where(whereCondition)
        .orderBy(desc(productos.ultimaActualizacion))
        .limit(limit)
        .offset(page * limit),

      db
        .select({ cantidad: count() })
        .from(productos)
        .where(whereCondition),
    ]);

    // 2. Obtener stock de TODAS las sucursales de una sola vez
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

    // 3. Agrupar stock por productoId en memoria
    const productoIdsSet = new Set(productosDB.map((p) => p.id));
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

    // 4. Combinar en el response final
    const productosConStock = productosDB.map((p) => {
      const stockData = stockMap.get(p.id);
      return {
        ...p,
        stock: stockData?.totalCantidad ?? 0,
        alertaStock: stockData?.alertaStock ?? 5,
        stockPorDeposito: stockData?.stockPorDeposito ?? [],
      };
    });

    const totalProductos = totalResult[0]?.cantidad ?? 0;
    const dataResponse = {
      productosDB: productosConStock,
      totalProductos,
      paginacion: {
        paginaActual: page,
        totalPaginas: Math.ceil(totalProductos / limit),
        porPagina: limit,
      },
    };
    return createResponse(200, "datos obtenidos correctamente", dataResponse);
  } catch (error) {
    console.error("Error en /api/stock/productos:", error);
    return createResponse(500, "Error interno", null);
  }
};
