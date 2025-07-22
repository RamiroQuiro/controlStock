import type { APIRoute } from 'astro';
import { and, eq, inArray, SQL, sql } from 'drizzle-orm';
import db from '../../../db';
import { productoCategorias, productos, stockActual } from '../../../db/schema';
import { cache } from '../../../utils/cache';

// Definimos tipos de errores
type ErrorResponse = {
  msg: string;
  code: number;
  details?: string;
};

// Errores específicos
const ERRORS = {
  INVALID_DATA: {
    msg: 'Datos inválidos o incompletos',
    code: 400,
  },
  INVALID_FILTER: {
    msg: 'Tipo de filtro inválido',
    code: 400,
  },
  INVALID_VALUE: {
    msg: 'El valor de modificación no puede ser 0',
    code: 400,
  },
  INVALID_PRICE_TYPE: {
    msg: 'Tipo de precio a afectar inválido',
    code: 400,
  },
  NO_PRODUCTS: {
    msg: 'No se encontraron productos para modificar',
    code: 404,
  },
  DB_ERROR: {
    msg: 'Error en la base de datos',
    code: 500,
  },
} as const;

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const {
      userId,
      filtroTipo,
      valorSeleccionado,
      tipoModificacion,
      operacion,
      valor,
      afectarPrecio,
    } = await request.json();
    const { rol, empresaId } = locals.user;

    console.log('✅ data entrando', {
      userId,
      filtroTipo,
      valorSeleccionado,
      tipoModificacion,
      operacion,
      valor,
      afectarPrecio,
    });

    // Validaciones básicas
    if (!userId || !filtroTipo || !valorSeleccionado || !tipoModificacion) {
      return createErrorResponse(ERRORS.INVALID_DATA);
    }
    if (rol !== 'admin' && rol !== 'repositor') {
      return createErrorResponse(ERRORS.INVALID_ROLE);
    }
    const valorNumerico = Number(valor);
    if (!valorNumerico || isNaN(valorNumerico)) {
      return createErrorResponse(ERRORS.INVALID_VALUE);
    }

    // Construcción de filtro según tipo
    let condicionFiltro: SQL<unknown>;
    switch (filtroTipo) {
      case 'categorias':
        const idsPorCategoria = await db
          .select({ productoId: productoCategorias.productoId })
          .from(productoCategorias)
          .where(eq(productoCategorias.categoriaId, valorSeleccionado.id));
        condicionFiltro = inArray(
          productos.id,
          idsPorCategoria.map((p) => p.productoId)
        );
        break;

      case 'ubicaciones':
        const productosUbicacion = await db
          .select({ productoId: stockActual.productoId })
          .from(stockActual)
          .where(eq(stockActual.localizacion, valorSeleccionado.nombre));
        condicionFiltro = inArray(
          productos.id,
          productosUbicacion.map((p) => p.productoId)
        );
        break;

      case 'depositos':
        const productosDeposito = await db
          .select({ productoId: stockActual.productoId })
          .from(stockActual)
          .where(eq(stockActual.deposito, valorSeleccionado.nombre));
        condicionFiltro = inArray(
          productos.id,
          productosDeposito.map((p) => p.productoId)
        );
        break;

      case 'todas':
        condicionFiltro = eq(productos.empresaId, empresaId);
        break;

      default:
        return createErrorResponse(ERRORS.INVALID_FILTER);
    }

    // Verificar existencia de productos
    const productosExistentes = await db
      .select({ count: sql<number>`count(*)` })
      .from(productos)
      .where(and(condicionFiltro, eq(productos.empresaId, empresaId)));

    if (productosExistentes[0].count === 0) {
      return createErrorResponse(ERRORS.NO_PRODUCTS);
    }

    // Lógica de modificación
    let actualizacionPrecioVenta, actualizacionPrecioCompra;

    if (tipoModificacion === 'porcentaje') {
      const porcentaje = valorNumerico / 100;
      const multiplicador = 1 + porcentaje;

      if (multiplicador <= 0) {
        return createErrorResponse({
          msg: 'El porcentaje haría que el precio sea 0 o negativo',
          code: 400,
        });
      }

      actualizacionPrecioVenta = sql`${productos.pVenta} * ${multiplicador}`;
      actualizacionPrecioCompra = sql`${productos.pCompra} * ${multiplicador}`;
    } else {
      const operadorSQL: '+' | '-' = operacion === 'sumar' ? '+' : '-';
      const valorAbs = Math.abs(valorNumerico);

      actualizacionPrecioVenta = sql`${productos.pVenta} ${sql.raw(operadorSQL)} ${valorAbs}`;
      actualizacionPrecioCompra = sql`${productos.pCompra} ${sql.raw(operadorSQL)} ${valorAbs}`;
    }

    const actualizacion: Record<string, any> = {};
    switch (afectarPrecio) {
      case 'venta':
        actualizacion.pVenta = actualizacionPrecioVenta;
        break;
      case 'compra':
        actualizacion.pCompra = actualizacionPrecioCompra;
        break;
      case 'ambos':
        actualizacion.pVenta = actualizacionPrecioVenta;
        actualizacion.pCompra = actualizacionPrecioCompra;
        break;
      default:
        return createErrorResponse(ERRORS.INVALID_PRICE_TYPE);
    }

    // Aplicar actualización
    if (filtroTipo === 'todas' || filtroTipo === 'categorias') {
      await db
        .update(productos)
        .set(actualizacion)
        .where(and(condicionFiltro, eq(productos.empresaId, empresaId)));
    } else {
      await db.transaction(async (trx) => {
        const prodAfectados = await trx
          .select({ productoId: productos.id })
          .from(productos)
          .where(and(condicionFiltro, eq(productos.empresaId, empresaId)));

        const ids = prodAfectados.map((p) => p.productoId);
        if (ids.length > 0) {
          await trx
            .update(productos)
            .set(actualizacion)
            .where(and(condicionFiltro, eq(productos.empresaId, empresaId)));
        }
      });
    }

    // Invalidar caché
    await cache.invalidate('stock');

    return new Response(
      JSON.stringify({
        msg: 'Precios actualizados correctamente',
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error general en PUT:', error);
    return createErrorResponse({
      msg: 'Error interno del servidor',
      code: 500,
      details: error instanceof Error ? error.message : 'Error desconocido',
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
