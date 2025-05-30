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
      categoriasIds: data.get('categoriasIds')?.toString() || '[]',
      deposito: data.get('deposito')?.toString() || '',
      impuesto: data.get('impuesto')?.toString() || '21%',
      empresaId: data.get('empresaId') || '',
      creadoPor: data.get('userId')?.toString() || '',
      iva: Number(data.get('iva') || 21),
      descuento: Number(data.get('descuento') || 0),
      modelo: data.get('modelo')?.toString() || '',
      marca: data.get('marca')?.toString() || '',
      localizacion: data.get('localizacion')?.toString() || '',
      alertaStock: Number(data.get('alertaStock') || 0),
      codigoBarra: data.get('codigoBarra')?.toString() || '',
    };
    // parsar catogoriasIds

    const categoriasIds = JSON.parse(productoData.categoriasIds);
    console.log('categoriasIds ->', categoriasIds);
    // Validar imagen
    const fotoProducto = data.get('fotoProducto') as File;
    if (!fotoProducto || !(fotoProducto instanceof File)) {
      console.error('Archivo de imagen no válido');
      return new Response(
        JSON.stringify({
          status: 400,
          msg: 'Se requiere una imagen válida para el producto',
        }),
        { status: 400 }
      );
    }

    // Validar directorio
    const userDir = path.join(
      process.cwd(),
      'element',
      'imgs',
      productoData.empresaId,
      'productos'
    );
    const dirExists = await fs
      .access(userDir)
      .then(() => true)
      .catch(() => false);

    if (!dirExists) {
      console.error('Directorio no encontrado:', userDir);
      await fs.mkdir(userDir, { recursive: true });
    }

    // Procesar imagen
    const imageId = nanoid(10);
    const extension = path.extname(fotoProducto.name);
    const nombreArchivo = `${imageId}${extension}`;
    const rutaGuardado = path.join(userDir, nombreArchivo);
    const rutaRelativa = `/element/imgs/${productoData.empresaId}/productos/${nombreArchivo}`;

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

    // Crear producto en la base de datos
    const creacionProducto = await db.transaction(async (trx) => {
      const id = nanoid(10);
      const fechaHoy = new Date();
      try {
        const [insertedProduct] = await trx
          .insert(productos)
          .values({
            id,
            nombre: productoData.nombre,
            created_at: fechaHoy,
            descripcion: productoData.descripcion,
            iva: productoData.iva,
            precio: productoData.precio,
            pCompra: productoData.pCompra,
            pVenta: productoData.pVenta,
            codigoBarra: productoData.codigoBarra,
            alertaStock: productoData.alertaStock,
            modelo: productoData.modelo,
            descuento: productoData.descuento,
            empresaId: productoData.empresaId,
            impuesto: productoData.impuesto,
            marca: productoData.marca,
            updatedAt: sql`(strftime('%s','now'))`,
            stock: productoData.stock,
            userId: productoData.userId,
            srcPhoto: rutaRelativa,
          })
          .returning();

        if (categoriasIds && categoriasIds.length > 0) {
          await Promise.all(
            categoriasIds.map((categoriaId: string) =>
              db.insert(productoCategorias).values({
                id: generateId(10),
                productoId: insertedProduct.id,
                categoriaId,
              })
            )
          );
        }
        // Crear registro de stock
        await trx.insert(stockActual).values({
          id: nanoid(10),
          productoId: id,
          cantidad: productoData.stock,
          alertaStock: productoData.alertaStock,
          localizacion: productoData.localizacion,
          created_at: fechaHoy,
          deposito: productoData.deposito,
          updatedAt: sql`(strftime('%s','now'))`,
        });

        // Registrar movimiento de stock
        await trx.insert(movimientosStock).values({
          id: nanoid(10),
          productoId: id,
          cantidad: productoData.stock,
          userId: productoData.userId,
          clienteId: null,
          proveedorId: null,
          fecha: fechaHoy,
          tipo: 'ingreso',
          motivo: 'StockInicial',
        });

        return insertedProduct;
      } catch (dbError) {
        console.error('Error en la transacción de base de datos:', dbError);
        throw dbError;
      }
    });
    // Invalida el caché de productos para este usuario
    await cache.invalidate(`stock_data_${productoData.userId}`);
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
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      { status: 500 }
    );
  }
}
