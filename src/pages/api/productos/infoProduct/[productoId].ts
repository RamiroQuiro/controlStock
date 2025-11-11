import type { APIRoute } from "astro";
import db from "../../../../db";
import {
  categorias,
  clientes,
  depositos,
  movimientosStock,
  productos,
  proveedores,
  stockActual,
  ubicaciones,
} from "../../../../db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { productoCategorias } from "../../../../db/schema/productoCategorias";

export const GET: APIRoute = async ({ params }) => {
  const { productoId } = params;
  
  if (!productoId) {
    return new Response(
      JSON.stringify({ error: "ID del producto no proporcionado" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Primero obtenemos la empresaId para evitar subqueries
    const empresaResult = await db
      .select({ empresaId: productos.empresaId })
      .from(productos)
      .where(eq(productos.id, productoId))
      .limit(1);

    if (!empresaResult.length) {
      return new Response(
        JSON.stringify({ error: "Producto no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const empresaId = empresaResult[0].empresaId;

    // Ejecutamos todas las consultas en paralelo con índices optimizados
    const [
      productDataRaw,
      categoriasDelProducto,
      depositosDB,
      ubicacionesDB
    ] = await Promise.all([
      // 🔍 CONSULTA PRINCIPAL OPTIMIZADA
      db
        .select({
          id: productos.id,
          creadoPor: productos.creadoPor,
          descripcion: productos.descripcion,
          stock: productos.stock,
          marca: productos.marca,
          isEcommerce: productos.isEcommerce,
          srcPhoto: productos.srcPhoto,
          empresaId: productos.empresaId,
          peso: productos.peso,
          dimensiones: productos.dimensiones,
          codigoBarra: productos.codigoBarra,
          unidadMedida: productos.unidadMedida,
          creado: productos.created_at,
          ultimaActualizacion: productos.ultimaActualizacion,
          pCompra: productos.pCompra,
          isOferta: productos.isOferta,
          reservado: stockActual.reservado,
          pVenta: productos.pVenta,
          diasOferta: productos.diasOferta,
          precioOferta: productos.precioOferta,
          iva: productos.iva,
          impuesto: productos.impuesto,
          signoDescuento: productos.signoDescuento,
          descuento: productos.descuento,
          modelo: productos.modelo,
          alertaStock: stockActual.alertaStock,
          cantidadReservada: stockActual.reservado,
          ultimaReposicion: stockActual.ultimaReposicion,
          localizacionesId: stockActual.localizacionesId,
          ubicacionesId: stockActual.ubicacionesId,
          depositosId: stockActual.depositosId,
        })
        .from(productos)
        .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
        .where(
          and(
            eq(productos.id, productoId),
            eq(productos.empresaId, empresaId) // ✅ Usamos empresaId ya conocido
          )
        )
        .limit(1),

      // 🏷️ CATEGORÍAS CON ÍNDICE OPTIMIZADO
      db
        .select({
          id: categorias.id,
          nombre: categorias.nombre,
          descripcion: categorias.descripcion,
        })
        .from(productoCategorias)
        .innerJoin(categorias, eq(productoCategorias.categoriaId, categorias.id))
        .where(
          and(
            eq(productoCategorias.productoId, productoId),
            eq(categorias.empresaId, empresaId) // ✅ Filtro adicional
          )
        ),

      // 🏭 DEPÓSITOS OPTIMIZADOS
      db
        .select({
          id: depositos.id,
          nombre: depositos.nombre,
        })
        .from(depositos)
        .where(eq(depositos.empresaId, empresaId)), // ✅ Sin subquery

      // 📍 UBICACIONES OPTIMIZADAS
      db
        .select({
          id: ubicaciones.id,
          nombre: ubicaciones.nombre,
          depositoId: ubicaciones.depositoId
        })
        .from(ubicaciones)
        .where(eq(ubicaciones.empresaId, empresaId)) // ✅ Sin subquery
    ]);

    const productData = productDataRaw?.[0] ?? null;

    if (!productData) {
      return new Response(
        JSON.stringify({ error: "Producto no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        data: {
          productData: {
            ...productData,
            categorias: categoriasDelProducto,
          },
          depositosDB,
          ubicacionesDB,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener los datos del producto:", error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "Error al buscar los datos del producto",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};