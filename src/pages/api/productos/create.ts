import type { APIContext } from 'astro';
import db from '../../../db';
import { nanoid } from 'nanoid';
import { movimientosStock, productos, stockActual } from '../../../db/schema';
import { sql } from 'drizzle-orm';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { cache } from '../../../utils/cache';
import type { Producto } from '../../../types';
import { productoCategorias } from '../../../db/schema/productoCategorias';
import { generateId } from 'lucia';
import { getFechaUnix } from '../../../utils/timeUtils';

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    const data = await request.formData();

    // Validar campos requeridos
    const requiredFields = ['userId', 'codigoBarra', 'descripcion'];
    const missingFields = requiredFields.filter((field) => !data.get(field));

    if (missingFields.length > 0) {
      console.error('Campos requeridos faltantes:', missingFields);
      return new Response(
        JSON.stringify({
          status: 400,
          msg: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
        }),
        { status: 400 }
      );
    }

    // Extraer y validar datos
    const productoData: Producto = {
      nombre: data.get('nombre')?.toString() || '',
      userId: data.get('userId')?.toString() || '',
      descripcion: data.get('descripcion')?.toString() || '',
      precio: parseFloat(data.get('precio')?.toString() || '0'),
      stock: parseInt(data.get('stock')?.toString() || '0'),
      pVenta: Number(data.get('pVenta') || 0),
      pCompra: Number(data.get('pCompra') || 0),
      categoriasIds: data.get('categoriasIds'),
      deposito: data.get('deposito')?.toString() || '',
      impuesto: data.get('impuesto')?.toString() || '21%',
      empresaId: data.get('empresaId')?.toString() || '',
      creadoPor: data.get('userId')?.toString() || '',
      iva: Number(data.get('iva') || 21),
      descuento: Number(data.get('descuento') || 0),
      modelo: data.get('modelo')?.toString() || '',
      ubicacionId: data.get('ubicacionId')?.toString() || '',
      depositoId: data.get('depositoId')?.toString() || '',
      marca: data.get('marca')?.toString() || '',
      localizacion: data.get('localizacion')?.toString() || '',
      alertaStock: Number(data.get('alertaStock') || 0),
      codigoBarra: data.get('codigoBarra')?.toString() || '',
    };
    console.log('productoData ->', productoData);
    
    // Parsear categoriasIds con manejo seguro de errores
    let categoriasIds = [];
    try {
      categoriasIds = JSON.parse(productoData.categoriasIds);
      if (!Array.isArray(categoriasIds)) {
        categoriasIds = [];
      }
    } catch (e) {
      console.error('Error al parsear categoriasIds:', e);
      // Si hay error, inicializar como array vacío
      categoriasIds = [];
    }
    
    console.log('categoriasIds ->', categoriasIds);
    
    // Validar imagen
    const fotoProducto = data.get('fotoProducto') as File;
    let rutaRelativa = '';
    
    if (fotoProducto && fotoProducto instanceof File && fotoProducto.size > 0) {
      // Validar directorio
      const userDir = path.join(
        process.cwd(),
        'element',
        'imgs',
        productoData.empresaId,
        'productos'
      );
      
      try {
        await fs.access(userDir);
      } catch (e) {
        // Directorio no existe, crearlo
        await fs.mkdir(userDir, { recursive: true });
      }

      // Procesar imagen
      const imageId = nanoid(10);
      const extension = path.extname(fotoProducto.name);
      const nombreArchivo = `${imageId}${extension}`;
      const rutaGuardado = path.join(userDir, nombreArchivo);
      rutaRelativa = `/element/imgs/${productoData.empresaId}/productos/${nombreArchivo}`;

      try {
        const buffer = await fotoProducto.arrayBuffer();
        await sharp(Buffer.from(buffer))
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toFile(rutaGuardado);
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        return new Response(
          JSON.stringify({
            status: 500,
            msg: 'Error al procesar la imagen del producto',
          }),
          { status: 500 }
        );
      }
    } else {
      // Si no hay imagen, usar una imagen por defecto o dejar vacío
      rutaRelativa = '/element/imgs/default-product.jpg';
    }

    // Crear producto en la base de datos
    const creacionProducto = await db.transaction(async (trx) => {
      const id = nanoid(10);
      const fechaHoy = new Date();
      console.log('fechaHoy ->', fechaHoy);
      // Insertar producto
      const [insertedProduct] = await trx
        .insert(productos)
        .values({
          id,
          nombre: productoData.nombre,
          created_at: fechaHoy,
          descripcion: productoData.descripcion,
          iva: productoData.iva,
          pCompra: productoData.pCompra,
          pVenta: productoData.pVenta,
          codigoBarra: productoData.codigoBarra,
          alertaStock: productoData.alertaStock,
          modelo: productoData.modelo,
          descuento: productoData.descuento,
          empresaId: productoData.empresaId,
          impuesto: productoData.impuesto,
          marca: productoData.marca,
          stock: productoData.stock,
          userId: productoData.userId,
          srcPhoto: rutaRelativa,
        })
        .returning();
        console.log('empezando a verificar relacion y exitencia de categoria ->', categoriasIds)

      // Insertar relaciones con categorías si existen
      if (categoriasIds && categoriasIds.length > 0) {
        console.log('categoriasIds ->', categoriasIds)
        for (const categoriaId of categoriasIds) {
          await trx.insert(productoCategorias).values({
            id: generateId(10),
            productoId: id,
            categoriaId,
          })
        }
      }
      
      // Crear registro de stock
      console.log('empezando a crear registro de stock')
      await trx.insert(stockActual).values({
        id: nanoid(10),
        productoId: id,
        cantidad: productoData.stock,
        alertaStock: productoData.alertaStock,
        ubicacionesId: productoData.ubicacionId,  
        createdAt: fechaHoy,
        userUltimaReposicion: productoData.userId,
        depositosId: productoData.depositoId,
        empresaId: productoData.empresaId,

      });

      console.log('empezando a registrar movimiento de stock')
      // Registrar movimiento de stock
      await trx.insert(movimientosStock).values({
        id: nanoid(10),
        productoId: id,
        cantidad: productoData.stock,
        userId: productoData.userId,
        clienteId: null,
        empresaId: productoData.empresaId,
        proveedorId: null,
        fecha: fechaHoy,
        tipo: 'ingreso',
        motivo: 'StockInicial',
      });

      return insertedProduct;
    });
// Invalida el caché de productos para este usuario
await cache.invalidate(`stock_data_${productoData.empresaId}`);

// También podríamos invalidar otros cachés relacionados
if (productoData.empresaId) {
  await cache.invalidate(`empresa_productos_${productoData.empresaId}`);
}

// Si tienes un caché para categorías, también lo invalidamos
if (categoriasIds.length > 0) {
  await cache.invalidate(`categorias_data`);
  for (const catId of categoriasIds) {
    await cache.invalidate(`categoria_productos_${catId}`);
  }
}

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Producto creado correctamente',
        data: creacionProducto,
      })
    );
  } catch (error) {
    console.error('Error general:', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
      return new Response(
        JSON.stringify({
          status: 409,
          msg: 'Ya existe un producto con ese código de barras',
        }),
        { status: 409 }
      );
    }

    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error interno del servidor al procesar la solicitud',
        error: error.message || 'Error desconocido',
      }),
      { status: 500 }
    );
  }
}