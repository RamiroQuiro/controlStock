import { eq, and, or, like, not } from "drizzle-orm";
import db from "../db";
import {
  productos,
  stockActual,
  proveedores,
  movimientosStock,
  detalleVentas,
  productoCategorias,
} from "../db/schema";
import type { Producto } from "../types";
import { normalizadorUUID } from "../utils/normalizadorUUID";

/**
 * Servicio para interactuar directamente con la tabla de productos en la base de datos.
 */

/**
 * Obtiene productos de una empresa, opcionalmente filtrados por un término y tipo de búsqueda.
 * El stock se agrega a través de TODAS las sucursales/depósitos.
 * @param empresaId - El ID de la empresa.
 * @param query - El término de búsqueda (opcional).
 * @param tipo - El tipo de búsqueda, ej. 'codigoBarra' para búsqueda exacta (opcional).
 * @returns Una lista de productos con el stock total y desglose por depósito.
 */
export const getProductosFromDB = async (
  empresaId: string,
  query?: string | null,
  tipo?: string | null
) => {
  try {
    // 1. Obtener productos filtrados (sin join de stock para evitar filas duplicadas)
    const conditions: any[] = [eq(productos.empresaId, empresaId)];

    if (query) {
      if (tipo === "codigoBarra") {
        conditions.push(eq(productos.codigoBarra, query));
      } else {
        conditions.push(
          or(
            like(productos.codigoBarra, `%${query}%`),
            like(productos.descripcion, `%${query}%`),
            like(productos.categoria, `%${query}%`),
            like(productos.marca, `%${query}%`),
            like(productos.modelo, `%${query}%`)
          )
        );
      }
    }

    const productosResult = await db
      .select({ producto: productos, proveedor: proveedores })
      .from(productos)
      .leftJoin(proveedores, eq(productos.proveedorId, proveedores.id))
      .where(and(...conditions));

    if (productosResult.length === 0) return [];

    // 2. Obtener stock de TODAS las sucursales para esta empresa de una sola vez
    const { depositos } = await import("../db/schema");
    const stockRows = await db
      .select({
        productoId: stockActual.productoId,
        cantidad: stockActual.cantidad,
        alertaStock: stockActual.alertaStock,
        reservado: stockActual.reservado,
        depositoId: stockActual.depositosId,
        depositoNombre: depositos.nombre,
        depositoPrincipal: depositos.principal,
      })
      .from(stockActual)
      .leftJoin(depositos, eq(stockActual.depositosId, depositos.id))
      .where(eq(stockActual.empresaId, empresaId));

    // 3. Agrupar stock por productoId en memoria
    const productoIds = new Set(productosResult.map((r) => r.producto.id));
    const stockMap = new Map<string, {
      totalCantidad: number;
      alertaStock: number;
      stockPorDeposito: Array<{
        depositoId: string | null;
        depositoNombre: string | null;
        cantidad: number;
        principal: boolean;
      }>;
    }>();

    for (const row of stockRows) {
      if (!productoIds.has(row.productoId)) continue;
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

    // 4. Combinar producto + stock agregado
    return productosResult.map(({ producto, proveedor }) => {
      const stockData = stockMap.get(producto.id);
      console.log(`📦 ${producto.nombre} | stock total: ${stockData?.totalCantidad ?? 0} unidades en ${stockData?.stockPorDeposito.length ?? 0} sucursal(es)`);
      return {
        ...producto,
        proveedor,
        stock: {
          cantidad: stockData?.totalCantidad ?? 0,
          alertaStock: stockData?.alertaStock ?? 5,
          stockPorDeposito: stockData?.stockPorDeposito ?? [],
        },
      };
    });
  } catch (error) {
    console.error("Error al obtener productos de la DB:", error);
    throw new Error("No se pudieron obtener los productos.");
  }
};

/**
 * Elimina un producto y todos sus registros asociados en una transacción.
 * @param productoId - El ID del producto a eliminar.
 * @returns true si la eliminación fue exitosa.
 */
export const deleteProductoFromDB = async (productoId: string) => {
  try {
    const { empresas } = await import("../db/schema");
    const { sql } = await import("drizzle-orm");

    const [producto] = await db
      .select({ empresaId: productos.empresaId })
      .from(productos)
      .where(eq(productos.id, productoId));

    if (!producto) return true;

    await db.transaction(async (trx) => {
      await trx
        .delete(movimientosStock)
        .where(eq(movimientosStock.productoId, productoId));
      await trx
        .delete(detalleVentas)
        .where(eq(detalleVentas.productoId, productoId));
      await trx
        .delete(stockActual)
        .where(eq(stockActual.productoId, productoId));
      
      await trx.delete(productos).where(eq(productos.id, productoId));

      // Actualizar contador en Empresa
      if (producto.empresaId) {
        await trx
          .update(empresas)
          .set({
            cantidadProductos: sql`${empresas.cantidadProductos} - 1`,
          })
          .where(eq(empresas.id, producto.empresaId));
      }
    });

    return true;
  } catch (error) {
    console.error("Error al eliminar el producto de la DB:", error);
    throw new Error("No se pudo eliminar el producto.");
  }
};

// Aquí añadiremos progresivamente el resto de funciones CRUD:
// - getProductoByIdFromDB
// - createProductoInDB

/**
 * Actualiza un producto y sus relaciones en una transacción.
 * @param productoId - El ID del producto a actualizar.
 * @param data - Los datos del producto a actualizar.
 * @param empresaId - El ID de la empresa para validación de unicidad.
 * @returns El producto actualizado.
 */
export const updateProductoInDB = async (
  productoId: string,
  data: any,
  empresaId: string
) => {
  const { categorias, ...dataProducto } = data;
  const categoriasIds = categorias
    ? categorias.map((cat: { id: string }) => cat.id)
    : [];

  console.log("empezando a buscar el producto actual");
  try {
    const [productoActual] = await db
      .select()
      .from(productos)
      .where(eq(productos.id, productoId));

    if (!productoActual) {
      throw new Error("Producto no encontrado");
    }

    console.log("codigo barra", data.codigoBarra);
    console.log("codigo barra actual", productoActual.codigoBarra);
    if (data.codigoBarra && data.codigoBarra !== productoActual.codigoBarra) {
      console.log("codigo barra no coincide");
      const [productoExistente] = await db
        .select()
        .from(productos)
        .where(
          and(
            eq(productos.codigoBarra, data.codigoBarra),
            eq(productos.empresaId, empresaId),
            not(eq(productos.id, productoId))
          )
        );

      if (productoExistente) {
        console.log("producto existente");
        throw new Error("Ya existe un producto con este código de barras");
      }
    }

    console.log("empezando a actualizar el producto");
    const dataUpdate = await db.transaction(async (trx) => {
      const ultimaActualizacion = new Date();
      const dataProductoUpdate = { ...dataProducto, ultimaActualizacion };
      delete dataProductoUpdate.created_at;
      const fechaInicioOferta = dataProducto.fechaInicioOferta
        ? new Date(dataProducto.fechaInicioOferta)
        : null;
      const fechaFinOferta = dataProducto.fechaFinOferta
        ? new Date(dataProducto.fechaFinOferta)
        : null;
      dataProductoUpdate.fechaInicioOferta = fechaInicioOferta;
      dataProductoUpdate.fechaFinOferta = fechaFinOferta;

      console.log("actualizando el producto");
      const [actualizarProducto] = await trx
        .update(productos)
        .set(dataProductoUpdate)
        .where(eq(productos.id, productoId))
        .returning();

      // Solo actualizar categorías si vienen en el request
      if (categorias !== undefined) {
        await trx
          .delete(productoCategorias)
          .where(eq(productoCategorias.productoId, actualizarProducto.id));

        if (categoriasIds.length > 0) {
          await Promise.all(
            categoriasIds.map(async (categoriaId: string) => {
              return await trx.insert(productoCategorias).values({
                id: normalizadorUUID("productoCategorias", 10),
                productoId: actualizarProducto.id,
                categoriaId: categoriaId,
              });
            })
          );
        }
      }

      console.log("actualizando el stock");
      await trx
        .update(stockActual)
        .set({
          reservado: dataProducto.reservado,
          // Asegúrate de que estos campos existan en tu schema de stockActual si los vas a usar
          // depositosId: dataProducto.depositosId,
          alertaStock: dataProducto.alertaStock,
          // ubicacionesId: dataProducto.ubicacionesId,
        })
        .where(eq(stockActual.productoId, productoId));

      return actualizarProducto;
    });

    return dataUpdate;
  } catch (error) {
    console.error("Error al actualizar el producto en la DB:", error);
    // Relanzamos el error para que la API route lo capture
    throw error;
  }
};
