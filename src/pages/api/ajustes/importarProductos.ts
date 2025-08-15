import type { APIRoute } from "astro";
import Papa from "papaparse";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "../../../db";
import {
  categorias,
  productoCategorias,
  productos,
  stockActual,
  movimientosStock,
} from "../../../db/schema";
import { cache } from "../../../utils/cache";
import { getFechaUnix } from "../../../utils/timeUtils";

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
export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  const empresaId = user?.empresaId;
  const userId = user?.id;

  if (!empresaId) {
    console.warn("No se pudo identificar la empresa");
    return new Response(
      JSON.stringify({ message: "No se pudo identificar la empresa." }),
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file-productos") as File;

    if (!file) {
      console.warn("Archivo no encontrado en formData");
      return new Response(
        JSON.stringify({ message: "No se ha subido ningún archivo." }),
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    console.log("Contenido del CSV recibido:\n", fileContent);

    // Categorías existentes
    const categoriasExistentes = await db
      .select()
      .from(categorias)
      .where(eq(categorias.empresaId, empresaId));

    const mapaCategorias = new Map(
      categoriasExistentes.map((c) => [c.nombre.toLowerCase(), c.id])
    );

    const resultadosDetallados: { fila: number; nombreProducto: string; estado: string; mensaje: string }[] = [];

    return new Promise((resolve) => {
      Papa.parse<ProductoCSV>(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          console.log("Resultados parseados:", results.data);

          for (const [index, row] of results.data.entries()) {
            const fila = index + 2; // +2 por encabezado y base 0
            const nombreProducto = row.nombre || 'Producto Desconocido';
            console.log(`Procesando fila ${fila}:`, row);

            // Validación de campos obligatorios
            if (!row.nombre || !row.codigoBarra || !row.stock || !row.pVenta) {
              console.warn(`Fila ${fila} inválida, faltan campos:`, row);
              resultadosDetallados.push({
                fila,
                nombreProducto,
                estado: 'Error',
                mensaje:
                  "Faltan campos obligatorios (nombre, codigoBarra, stock, pVenta).",
              });
              continue;
            }

            // Categoría
            const categoriaId = row.categoria
              ? mapaCategorias.get(row.categoria.toLowerCase())
              : null;
            if (row.categoria && !categoriaId) {
              console.warn(
                `Fila ${fila}: categoría no encontrada ->`,
                row.categoria
              );
              resultadosDetallados.push({
                fila,
                nombreProducto,
                estado: 'Error',
                mensaje: `La categoría '${row.categoria}' no existe.`,
              });
              continue;
            }

            try {
              await db.transaction(async (tx) => {
                const nuevoProductoId = nanoid();
                const stockInicial = parseInt(row.stock, 10) || 0;
                const fechaHoyDate = new Date(getFechaUnix()*1000);
                // 1. Insertar producto
                await tx.insert(productos).values({
                  id: nuevoProductoId,
                  nombre: row.nombre,
                  codigoBarra: row.codigoBarra,
                  srcPhoto:'/controlStockLogo.png',
                  stock: stockInicial,
                  pVenta: parseFloat(row.pVenta) || 0,
                  pCompra: row.pCompra ? parseFloat(row.pCompra) : undefined,
                  marca: row.marca,
                  descripcion: row.descripcion,
                  alertaStock: row.alertaStock
                    ? parseInt(row.alertaStock, 10)
                    : 10,
                  iva: row.iva ? parseInt(row.iva, 10) : 21,
                  unidadMedida: row.unidadMedida || "unidad",
                  empresaId: empresaId,
                  creadoPor:userId,
                });

                // 2. Insertar categoría si existe
                if (categoriaId) {
                  await tx.insert(productoCategorias).values({
                    id: nanoid(),
                    productoId: nuevoProductoId,
                    categoriaId,
                  });
                }

                // 3. Insertar stock inicial
                await tx.insert(stockActual).values({
                  id: nanoid(),
                  productoId: nuevoProductoId,
                  cantidad: stockInicial,
                  userUltimaReposicion: userId,
                  ultimaReposicion: fechaHoyDate,
                  empresaId: empresaId,
                  fecha: fechaHoyDate,
                });

                // 4. Insertar movimiento de stock
                await tx.insert(movimientosStock).values({
                  id: nanoid(),
                  productoId: nuevoProductoId,
                  tipo: "ingreso",
                  cantidad: stockInicial,
                  motivo: "Carga inicial por importación CSV",
                  fecha: fechaHoyDate,
                  empresaId: empresaId,
                  creadoPor: userId,
                  userId: userId,
                });
              });

              // Si la transacción fue exitosa, agregamos al resultado detallado
              resultadosDetallados.push({
                fila,
                nombreProducto,
                estado: 'Éxito',
                mensaje: 'Producto importado correctamente.',
              });

            } catch (error) {
                console.error(`Error en transacción para fila ${fila}:`, error);
                resultadosDetallados.push({
                    fila,
                    nombreProducto,
                    estado: 'Error',
                    mensaje: error instanceof Error ? error.message : "Error desconocido en la base de datos.",
                });
                continue;
            }
          }

          console.log("Proceso de importación finalizado.", resultadosDetallados);

          // Invalidar la caché de stock para esta empresa
          const cacheKey = `stock_data_${empresaId}`;
          await cache.invalidate(cacheKey);
          console.log(`[IMPORT] Caché invalidada para la clave: ${cacheKey}`);

          resolve(new Response(JSON.stringify(resultadosDetallados), { status: 200 }));
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          resolve(
            new Response(
              JSON.stringify({ message: "Error al procesar el archivo CSV." }),
              { status: 500 }
            )
          );
        },
      });
    });
  } catch (error) {
    console.error("Error en el endpoint de importación:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor." }),
      { status: 500 }
    );
  }
};
