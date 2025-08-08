import type { APIRoute } from 'astro';
import Papa from 'papaparse';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import db from '../../../db';
import { categorias, productoCategorias, productos } from '../../../db/schema';

// Tipos para mayor claridad
interface ProductoCSV {
  nombre: string;
  codigoBarra: string;
  stock: string;
  pVenta: string;
  pCompra?: string;
  categoria?: string;
  marca?: string;
  descripcion?: string;
  alertaStock?: string;
  iva?: string;
  unidadMedida?: string;
}

interface ResultadoImportacion {
  exitosos: number;
  errores: { fila: number; mensaje: string }[];
  productosCreados: { nombre: string; id: string }[];
}
// Endpoint: Importación de productos con debug detallado
export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  const empresaId = user?.empresaId;

  if (!empresaId) {
    return new Response(
      JSON.stringify({ message: 'No se pudo identificar la empresa.' }),
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file-productos') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ message: 'No se ha subido ningún archivo.' }),
        { status: 400 }
      );
    }

    const fileContent = await file.text();

    // Requeridos en el CSV (los nombres deben coincidir con los encabezados)
    const requiredHeaders = ['nombre', 'codigoBarra', 'stock', 'pVenta'];

    // Traer categorías existentes (map en minúsculas)
    const categoriasExistentes = await db
      .select()
      .from(categorias)
      .where(eq(categorias.empresaId, empresaId));
    const mapaCategorias = new Map(
      categoriasExistentes.map((c) => [
        String(c.nombre).trim().toLowerCase(),
        c.id,
      ])
    );

    // Traer códigos existentes para evitar duplicados
    const productosExistentes = await db
      .select({ codigoBarra: productos.codigoBarra })
      .from(productos)
      .where(eq(productos.empresaId, empresaId));
    const codigosExistentes = new Set(
      productosExistentes.map((p) =>
        p.codigoBarra ? String(p.codigoBarra).trim() : ''
      )
    );

    // Resultado y debug
    const resultado: ResultadoImportacion = {
      exitosos: 0,
      errores: [],
      productosCreados: [],
    };
    const debugLogs: any[] = [];

    // Usamos PapaParse en modo callback/Promise
    return new Promise((resolve) => {
      Papa.parse<Record<string, string>>(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => (h ? h.trim() : h),
        complete: async (results) => {
          // Headers detectados
          const headers =
            results.meta && results.meta.fields
              ? results.meta.fields.map((h) => (h || '').trim())
              : [];
          console.log('[IMPORT] Headers detectados:', headers);

          // Validar que existan los encabezados requeridos
          const faltantes = requiredHeaders.filter(
            (h) =>
              !headers.map((x) => x.toLowerCase()).includes(h.toLowerCase())
          );
          if (faltantes.length > 0) {
            const msg = `Faltan columnas obligatorias en el CSV: ${faltantes.join(', ')}`;
            console.error('[IMPORT] ' + msg);
            return resolve(
              new Response(
                JSON.stringify({ message: msg, headersDetected: headers }),
                { status: 400 }
              )
            );
          }

          debugLogs.push({ totalRowsParsed: results.data.length, headers });

          const productosAInsertar: any[] = [];
          const productoCategoriasAInsertar: any[] = [];
          const codigosEnArchivo = new Set<string>();

          for (const [idx, rawRow] of results.data.entries()) {
            const fila = idx + 2; // +1 por cabecera y +1 por base 1
            const row: Record<string, string> = {};
            // Normalizar keys a minúsculas trimmed
            for (const k of Object.keys(rawRow)) {
              if (k == null) continue;
              row[k.trim()] =
                rawRow[k] !== undefined && rawRow[k] !== null
                  ? String(rawRow[k]).trim()
                  : '';
            }

            const rowDebug: any = { fila, raw: row, errores: [] };

            // Validaciones básicas
            const nombre = (row['nombre'] || '').trim();
            const codigoBarra = (row['codigoBarra'] || '').trim();
            const stockRaw = (row['stock'] || '').trim();
            const pVentaRaw = (row['pVenta'] || '').trim();
            const categoriaRaw = (row['categoria'] || '').trim();

            // Campos obligatorios
            if (!nombre) rowDebug.errores.push('nombre vacío');
            if (!codigoBarra) rowDebug.errores.push('codigoBarra vacío');
            if (!stockRaw) rowDebug.errores.push('stock vacío');
            if (!pVentaRaw) rowDebug.errores.push('pVenta vacío');

            // Números válidos
            const stockNum = Number(stockRaw);
            const pVentaNum = Number(pVentaRaw);
            const pCompraNum = row['pCompra'] ? Number(row['pCompra']) : null;
            if (stockRaw && Number.isNaN(stockNum))
              rowDebug.errores.push(`stock no es numérico ('${stockRaw}')`);
            if (pVentaRaw && Number.isNaN(pVentaNum))
              rowDebug.errores.push(`pVenta no es numérico ('${pVentaRaw}')`);
            if (row['pCompra'] && Number.isNaN(pCompraNum))
              rowDebug.errores.push(
                `pCompra no es numérico ('${row['pCompra']}')`
              );

            // Duplicado en BD
            if (codigoBarra && codigosExistentes.has(codigoBarra)) {
              rowDebug.errores.push(
                `codigoBarra '${codigoBarra}' ya existe en la base`
              );
            }
            // Duplicado dentro del mismo archivo
            if (codigoBarra && codigosEnArchivo.has(codigoBarra)) {
              rowDebug.errores.push(
                `codigoBarra '${codigoBarra}' duplicado en el archivo`
              );
            }

            // Validar categoría si viene
            let categoriaId: string | null = null;
            if (categoriaRaw) {
              const catId = mapaCategorias.get(categoriaRaw.toLowerCase());
              if (!catId) {
                rowDebug.errores.push(
                  `Categoría '${categoriaRaw}' no existe. (asegure cargar categorías antes)`
                );
              } else {
                categoriaId = catId;
              }
            }

            // Si hay errores, los volvemos parte del resultado y pasamos a la siguiente
            if (rowDebug.errores.length > 0) {
              resultado.errores.push({
                fila,
                errores: rowDebug.errores,
                datos: row,
              });
              debugLogs.push(rowDebug);
              continue;
            }

            // Preparar objeto a insertar
            const nuevoProductoId = nanoid();
            const pObj: any = {
              id: nuevoProductoId,
              nombre,
              codigoBarra,
              stock: Number.isNaN(stockNum) ? 0 : Math.floor(stockNum),
              pVenta: Number.isNaN(pVentaNum) ? 0 : pVentaNum,
              pCompra: Number.isNaN(pCompraNum) ? null : pCompraNum,
              marca: row['marca'] || null,
              descripcion: row['descripcion'] || null,
              alertaStock: row['alertaStock']
                ? parseInt(row['alertaStock'], 10)
                : 10,
              iva: row['iva'] ? parseInt(row['iva'], 10) : 21,
              unidadMedida: row['unidadMedida'] || 'unidad',
              empresaId,
              creadoPor: user.id,
            };

            productosAInsertar.push(pObj);
            if (categoriaId) {
              productoCategoriasAInsertar.push({
                id: nanoid(),
                productoId: nuevoProductoId,
                categoriaId,
              });
            }

            // Marcar codigo usado (para evitar duplicados dentro del archivo)
            if (codigoBarra) codigosEnArchivo.add(codigoBarra);

            // Push debug ok
            debugLogs.push({
              fila,
              ok: true,
              productoId: nuevoProductoId,
              nombre,
              codigoBarra,
            });
          } // fin for filas

          console.log(
            `[IMPORT] Filas válidas: ${productosAInsertar.length}, errores: ${resultado.errores.length}`
          );

          // Insertar en BD (en transacción si querés atomicidad parcial)
          try {
            if (productosAInsertar.length > 0) {
              await db.transaction(async (tx) => {
                await tx.insert(productos).values(productosAInsertar);
                if (productoCategoriasAInsertar.length > 0) {
                  await tx
                    .insert(productoCategorias)
                    .values(productoCategoriasAInsertar);
                }
              });

              resultado.exitosos = productosAInsertar.length;
              resultado.productosCreados = productosAInsertar.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                codigoBarra: p.codigoBarra,
              }));
              console.log('[IMPORT] Inserción realizada con éxito.');
            }
          } catch (insertErr) {
            console.error('[IMPORT] Error en inserción:', insertErr);
            // Si la inserción falla, volcamos el error en la respuesta para debug
            return resolve(
              new Response(
                JSON.stringify({
                  message: 'Error al insertar en BD',
                  error: String(insertErr),
                  debug: debugLogs.slice(0, 100),
                }),
                { status: 500 }
              )
            );
          }

          // Responder con detalle
          return resolve(
            new Response(JSON.stringify({ resultado, debug: debugLogs }), {
              status: 200,
            })
          );
        },
        error: (err) => {
          console.error('[IMPORT] Error parseando CSV:', err);
          return resolve(
            new Response(
              JSON.stringify({
                message: 'Error al procesar archivo CSV',
                error: String(err),
              }),
              { status: 500 }
            )
          );
        },
      });
    });
  } catch (error) {
    console.error('Error en el endpoint de importación:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor.' }),
      { status: 500 }
    );
  }
};
