import type { APIRoute } from "astro";
import { productos, stockActual } from "../../../db/schema";
import db from "../../../db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { createResponse } from "../../../types";

export const GET: APIRoute = async ({ request,locals }) => {
  const empresaId = locals.user?.empresaId;
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || 0;
  const limit =url.searchParams.get('limit') || 20;
  const pageNumber=parseInt(page)
  const limitNumber=parseInt(limit)
  try {
    const [productosDB, totalProductos] = await Promise.all([
      // Consulta ultra rápida de solo productos
      db
        .select({
          id: productos.id,
          nombre: productos.nombre,
          codigoBarra: productos.codigoBarra,
          descripcion: productos.descripcion,
          pCompra: productos.pCompra,
          pVenta: productos.pVenta,
          stock: productos.stock,
          srcPhoto: productos.srcPhoto,
          alertaStock: stockActual.alertaStock,
          ultimaActualizacion: productos.ultimaActualizacion,
        })
        .from(productos)
        .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
        .where(and(eq(productos.empresaId, empresaId), eq(productos.activo, true)))
        .orderBy(desc(productos.ultimaActualizacion))
        .limit(limitNumber)
        .offset(pageNumber * limitNumber),

      // Conteo
      db
        .select({ cantidad:count() })
        .from(productos)
        .where(and(eq(productos.empresaId, empresaId), eq(productos.activo, true)))
        
    ]);

    
    const dataResponse={
      productosDB,
      totalProductos,
      paginacion: {
        paginaActual: pageNumber,
        totalPaginas: Math.ceil(totalProductos / limitNumber),
        porPagina: limit,
      }
    }
    return createResponse(200,'datos obtenidos correctamente',dataResponse)
    
    
  } catch (error) {
    return createResponse(500,'Error interno',null)
  }
};

