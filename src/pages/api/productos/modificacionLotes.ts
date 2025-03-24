import type { APIRoute } from "astro";
import { and, eq, inArray, SQL, sql } from "drizzle-orm";
import db from "../../../db";
import { productos, stockActual } from "../../../db/schema";

// Definimos tipos de errores
type ErrorResponse = {
  msg: string;
  code: number;
  details?: string;
};

// Errores específicos
const ERRORS = {
  INVALID_DATA: {
    msg: "Datos inválidos o incompletos",
    code: 400,
  },
  INVALID_FILTER: {
    msg: "Tipo de filtro inválido",
    code: 400,
  },
  INVALID_VALUE: {
    msg: "El valor de modificación no puede ser 0",
    code: 400,
  },
  INVALID_PRICE_TYPE: {
    msg: "Tipo de precio a afectar inválido",
    code: 400,
  },
  NO_PRODUCTS: {
    msg: "No se encontraron productos para modificar",
    code: 404,
  },
  DB_ERROR: {
    msg: "Error en la base de datos",
    code: 500,
  },
} as const;

export const PUT: APIRoute = async ({ request }) => {
    try {
      const {
        userId,
        filtroTipo,
        valorSeleccionado,
        tipoModificacion,
        valor,
        afectarPrecio,
      } = await request.json();
  
      if (!userId || !filtroTipo || !valorSeleccionado || !tipoModificacion) {
        return createErrorResponse(ERRORS.INVALID_DATA);
      }
  
      if (valor === 0) {
        return createErrorResponse(ERRORS.INVALID_VALUE);
      }
  
      let condicionFiltro: SQL<unknown>;
  
      try {
        switch (filtroTipo) {
          case "categorias":
            condicionFiltro = eq(productos.categoria, valorSeleccionado);
            break;
          case "ubicaciones":
            // Primero obtenemos los IDs de los productos que están en esa ubicación
            const productosEnUbicacion = await db
              .select({ productoId: stockActual.productoId })
              .from(stockActual)
              .where(eq(stockActual.localizacion, valorSeleccionado));
            
            condicionFiltro = inArray(
              productos.id, 
              productosEnUbicacion.map(p => p.productoId)
            );
            break;
          case "depositos":
            // Similar para depósitos
            const productosEnDeposito = await db
              .select({ productoId: stockActual.productoId })
              .from(stockActual)
              .where(eq(stockActual.deposito, valorSeleccionado));
            
            condicionFiltro = inArray(
              productos.id, 
              productosEnDeposito.map(p => p.productoId)
            );
            break;
          case "todas":
            condicionFiltro = eq(productos.userId, userId);
            break;
          default:
            return createErrorResponse(ERRORS.INVALID_FILTER);
        }
  
        const productosExistentes = await db
          .select({ count: sql<number>`count(*)` })
          .from(productos)
          .where(and(condicionFiltro, eq(productos.userId, userId)));
  
        if (productosExistentes[0].count === 0) {
          return createErrorResponse(ERRORS.NO_PRODUCTS);
        }
  
        let actualizacionPrecioVenta, actualizacionPrecioCompra;
        if (tipoModificacion === "porcentaje") {
          const multiplicador = 1 + valor / 100;
          actualizacionPrecioVenta = sql`${productos.pVenta} * ${multiplicador}`;
          actualizacionPrecioCompra = sql`${productos.pCompra} * ${multiplicador}`;
        } else {
          actualizacionPrecioVenta = sql`${productos.pVenta} + ${valor}`;
          actualizacionPrecioCompra = sql`${productos.pCompra} + ${valor}`;
        }
  
        const actualizacion: Record<string, any> = {};
        switch (afectarPrecio) {
          case "venta":
            actualizacion.pVenta = actualizacionPrecioVenta;
            break;
          case "compra":
            actualizacion.pCompra = actualizacionPrecioCompra;
            break;
          case "ambos":
            actualizacion.pVenta = actualizacionPrecioVenta;
            actualizacion.pCompra = actualizacionPrecioCompra;
            break;
          default:
            return createErrorResponse(ERRORS.INVALID_PRICE_TYPE);
        }
  
        if (filtroTipo === "todas" || filtroTipo === "categorias") {
          await db
            .update(productos)
            .set(actualizacion)
            .where(and(condicionFiltro, eq(productos.userId, userId)));
        } else {
          await db.transaction(async (trx) => {
            const prodAfectados = await trx
              .select({ productoId: productos.id })
              .from(productos)
              .where(and(condicionFiltro, eq(productos.userId, userId)));
  
            console.log("productos afectados ->", prodAfectados);
  
            const idsAfectados = prodAfectados.map((p) => p.productoId);
            if (idsAfectados.length > 0) {
              await trx.update(productos).set(actualizacion).where(inArray(productos.id, idsAfectados));
            }
          });
  
          return new Response(
            JSON.stringify({
              msg: "Precios actualizados correctamente",
              status: 200,
            }),
            { status: 200 }
          );
        }
  
        return new Response(
          JSON.stringify({
            msg: "Precios actualizados correctamente",
            status: 200,
          }),
          { status: 200 }
        );
      } catch (error) {
        console.error("Error en la operación de base de datos:", error);
        return createErrorResponse({
          ...ERRORS.DB_ERROR,
          details: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    } catch (error) {
      console.error("Error en el procesamiento de la solicitud:", error);
      return createErrorResponse({
        msg: "Error interno del servidor",
        code: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };
  
  
// Función helper para crear respuestas de error
function createErrorResponse(error: ErrorResponse): Response {
  return new Response(
    JSON.stringify({
      msg: error.msg,
      code: error.code,
      details: error.details,
      status: error.code,
    }),
    { status: error.code }
  );
}
