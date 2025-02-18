import type { APIRoute } from "astro";
import db from "../../../../db";
import { movimientosStock, productos, stockActual } from "../../../../db/schema";
import { desc, eq } from "drizzle-orm";

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ params }) => {
  // Extraer el `productoId` de los parámetros
  const { productoId } = params;

  // Validación inicial: comprobar si el `productoId` está presente
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
    // Inicia una transacción para manejar consultas relacionadas al producto
    const result = await db.transaction(async (trx) => {
      // Consulta principal: obtener información del producto y su stock actual
      const productData = (await trx
        .select({
          id: productos.id,
          userId: productos.userId,
          descripcion:productos.descripcion,
          stock: productos.stock,
          categoria: productos.categoria,
          marca: productos.marca,
          srcPhoto:productos.srcPhoto,
          codigoBarra:productos.codigoBarra,
          creado:productos.created_at,
          ultimaActualizacion:productos.ultimaActualizacion,
          pCompra: productos.pCompra,
          pVenta: productos.pVenta,
          alertaStock: stockActual.alertaStock,
          cantidadReservada: stockActual.reservado,
          localizacion: stockActual.localizacion,
        })
        .from(productos)
        .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
        .where(eq(productos.id, productoId))).at(0)

      // Consulta secundaria: obtener movimientos de stock relacionados con el producto
      const stockMovimiento = await trx
        .select()
        .from(movimientosStock)
        .where(eq(movimientosStock.productoId, productoId)).
        orderBy(desc(movimientosStock.fecha))

      // Devuelve ambos resultados como un objeto
      return { productData, stockMovimiento };
    });

    // Respuesta exitosa con los datos obtenidos
    return new Response(
      JSON.stringify({
        status: 200,
        data: result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Manejo de errores durante la transacción o consultas
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
