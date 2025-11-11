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
import { getFechaUnix } from '../../../utils/timeUtils';
import { getProductosFromDB } from '../../../services/productos.db.service';

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('search');
  const tipo = url.searchParams.get('tipo');
  const { user } = locals;
  const empresaId = user?.empresaId;

  if (!empresaId) {
    return new Response(JSON.stringify({ error: 'Usuario no autenticado o sin empresa asignada' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // La lógica de DB y de búsqueda está en el servicio.
    // La API route solo orquesta.
    const resultados = await getProductosFromDB(empresaId, query, tipo);

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
    console.error('Error al obtener los datos del producto:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error en el servidor al buscar los datos del producto',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

import { deleteProductoFromDB } from '../../../services/productos.db.service';

export const DELETE: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const productoId = url.searchParams.get('search');
  const srcPhoto = request.headers.get('srcPhoto');

  if (!productoId) {
    return new Response(JSON.stringify({ msg: 'ID de producto requerido' }), { status: 400 });
  }

  try {
    // Lógica de DB centralizada en el servicio
    await deleteProductoFromDB(productoId);

    // La lógica de manejo de archivos se queda en la API route
    if (srcPhoto) {
      const imagePath = path.join(process.cwd(), 'public', srcPhoto.replace(/^\//, ''));
      try {
        // fs.promises.unlink para operaciones asíncronas
        await fs.unlink(imagePath);
        console.log(`Imagen eliminada: ${imagePath}`);
      } catch (imageError: any) {
        // Si el archivo no existe, no es un error fatal
        if (imageError.code !== 'ENOENT') {
          console.error('Error al eliminar la imagen:', imageError);
          // Opcional: decidir si la falla en eliminar la imagen debe devolver un error
        }
      }
    }

    // Invalidar caché
    await cache.invalidate(`stock_data_${productoId}`);

    return new Response(JSON.stringify({ status: 200, msg: 'Producto eliminado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el endpoint DELETE:', error);
    return new Response(JSON.stringify({ status: 500, msg: 'Error al eliminar el producto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
import { updateProductoInDB } from '../../../services/productos.db.service';

export const PUT: APIRoute = async ({ request, locals }) => {
  const data = await request.json();
  const url = new URL(request.url);
  const productoId = url.searchParams.get('search');
  const { user } = locals;
  const empresaId = user?.empresaId;

  if (!productoId || !empresaId) {
    return new Response(
      JSON.stringify({ msg: 'ID de producto y autenticación de empresa requeridos' }),
      { status: 400 }
    );
  }

  try {
    const productoActualizado = await updateProductoInDB(productoId, data, empresaId);

    // Invalidar caché
    await cache.invalidate(`stock_data_${empresaId}`);
    await cache.invalidate(`categorias_${empresaId}`);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Producto actualizado',
        data: productoActualizado,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error en el endpoint PUT:', error);
    
    // Determinar el código de estado basado en el tipo de error
    let statusCode = 500;
    if (error.message === 'Producto no encontrado') {
      statusCode = 404;
    } else if (error.message === 'Ya existe un producto con este código de barras') {
      statusCode = 409;
    }

    return new Response(
      JSON.stringify({
        status: statusCode,
        msg: error.message || 'Error al actualizar el producto',
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
