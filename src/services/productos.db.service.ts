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
import type { Producto, NewProducto } from "../types";

/**
 * Servicio para interactuar directamente con la tabla de productos en la base de datos.
 */

/**
 * Obtiene productos de una empresa, opcionalmente filtrados por un término y tipo de búsqueda.
 * @param empresaId - El ID de la empresa.
 * @param query - El término de búsqueda (opcional).
 * @param tipo - El tipo de búsqueda, ej. 'codigoBarra' para búsqueda exacta (opcional).
 * @returns Una lista de productos con detalles de stock y proveedor.
 */
export const getProductosFromDB = async (
  empresaId: string,
  query?: string | null,
  tipo?: string | null
) => {
  try {
    const baseQuery = db
      .select({
        producto: productos,
        stock: stockActual,
        proveedor: proveedores,
      })
      .from(productos)
      .leftJoin(stockActual, eq(productos.id, stockActual.productoId))
      .leftJoin(proveedores, eq(productos.proveedorId, proveedores.id));

    const conditions = [eq(productos.empresaId, empresaId)];

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

    const result = await baseQuery.where(and(...conditions));

    return result.map(({ producto, stock, proveedor }) => ({
      ...producto,
      stock: stock,
      proveedor: proveedor,
    }));
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
                id: generateId(10),
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
