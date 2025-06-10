import { and, eq, like, not, or } from 'drizzle-orm';
import {
  categorias,
  detalleVentas,
  movimientosStock,
  productos,
  stockActual,
} from '../../../db/schema';
import db from '../../../db';
import type { APIRoute } from 'astro';
import { cache } from '../../../utils/cache';
import path from 'path';
import { promises as fs } from 'fs';
import { productoCategorias } from '../../../db/schema/productoCategorias';
import { generateId } from 'lucia';
// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('search');
  const tipo = url.searchParams.get('tipo'); // Nuevo parámetro para distinguir el tipo de búsqueda
  const { user } = locals;
  const empresaId = user?.empresaId;
  if (!query) {
    return new Response(
      JSON.stringify({ error: 'falta el parametro de busqueda' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  try {
    let resultados;

    if (tipo === 'codigoBarra') {
      // Búsqueda exacta para código de barra
      resultados = await db
        .select()
        .from(productos)
        .where(
          and(
            eq(productos.empresaId, empresaId),
            eq(productos.codigoBarra, query)
          )
        );
      console.log('resultados', resultados);
    } else {
      // Búsqueda parcial para los demás campos
      resultados = await db
        .select()
        .from(productos)
        .where(
          and(
            eq(productos.empresaId, empresaId),
            or(
              like(productos.codigoBarra, `%${query}%`),
              like(productos.descripcion, `%${query}%`),
              like(productos.categoria, `%${query}%`),
              like(productos.marca, `%${query}%`),
              like(productos.modelo, `%${query}%`)
            )
          )
        );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        data: resultados,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Manejo de errores durante la transacción o consultas
    console.error('Error al obtener los datos del producto:', error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: 'Error al buscar los datos del producto',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const productoId = url.searchParams.get('search');
  const srcPhoto = request.headers.get('srcPhoto');
  try {
    const transacciones = await db.transaction(async (trx) => {
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

    if (srcPhoto) {
      const imagePath = path.join(
        process.cwd(),
        'public',
        srcPhoto.replace(/^\//, '')
      );

      try {
        // Verifica si el archivo existe antes de intentar eliminarlo
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Imagen eliminada: ${imagePath}`);
        }
      } catch (imageError) {
        console.error('Error al eliminar la imagen:', imageError);
        // No detenemos la eliminación del producto si falla la eliminación de la imagen
      }
    }
    // Invalida el caché de productos para este usuario
    await cache.invalidate(`stock_data_${productoId}`);

    // Invalida el caché de productos para este usuario
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Prodcuto eliminado',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Eliminar producto',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
export const PUT: APIRoute = async ({ request, params }) => {
  const data = await request.json();
  const url = new URL(request.url);
  const query = url.searchParams.get('search');

  // Extraer los IDs de categorías
  const categoriasIds = data.categorias
    ? data.categorias.map(
        (categoria: { id: string; nombre: string; descripcion: string }) =>
          categoria.id
      )
    : [];

  // Eliminar categorías del objeto data para evitar problemas en la actualización
  const { categorias, ...dataProducto } = data;

  console.log('Datos del producto:', dataProducto);

  try {
    // Obtener el producto actual
    const [productoActual] = await db
      .select()
      .from(productos)
      .where(eq(productos.id, data.id));

    if (!productoActual) {
      return new Response(
        JSON.stringify({
          status: 404,
          msg: 'Producto no encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Solo verificar unicidad si se está cambiando el código de barras
    if (data.codigoBarra && data.codigoBarra !== productoActual.codigoBarra) {
      // Verificar si ya existe otro producto con el mismo código de barras para este usuario

      const [productoExistente] = await db
        .select()
        .from(productos)
        .where(
          and(
            eq(productos.codigoBarra, data.codigoBarra),
            eq(productos.empresaId, productoActual.empresaId),
            not(eq(productos.id, query))
          )
        );

      if (productoExistente) {
        return new Response(
          JSON.stringify({
            status: 409,
            msg: 'Ya existe un producto con este código de barras',
          }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Proceder con la actualización
    const dataUpdate = await db.transaction(async (trx) => {
      // 1. Actualizar el producto
      const [actualizarProducto] = await trx
        .update(productos)
        .set(dataProducto)
        .where(eq(productos.id, query))
        .returning();

      // 2. Eliminar las relaciones existentes de categorías
      await trx
        .delete(productoCategorias)
        .where(eq(productoCategorias.productoId, actualizarProducto.id));

      // 3. Insertar las nuevas relaciones de categorías
      if (categoriasIds.length > 0) {
        // Usar Promise.all para ejecutar todas las inserciones
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

      // 4. Actualizar el stock
      await trx
        .update(stockActual)
        .set({
          reservado: dataProducto.reservado,
          deposito: dataProducto.deposito,
          alertaStock: dataProducto.alertaStock,
          localizacion: dataProducto.localizacion,
        })
        .where(eq(stockActual.productoId, query));

      return actualizarProducto;
    });

    // Invalidar caché
    await cache.invalidate(`stock_data_${dataUpdate.empresaId}`);
    await cache.invalidate(`categorias_${dataUpdate.empresaId}`);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'producto actualizado',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'error al actualizar producto',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
