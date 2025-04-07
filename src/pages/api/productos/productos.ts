import { eq, like, or } from "drizzle-orm";
import {
  detalleVentas,
  movimientosStock,
  productos,
  stockActual,
} from "../../../db/schema";
import db from "../../../db";
import type { APIRoute } from "astro";
import { cache } from "../../../utils/cache";

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("search");
  const tipo = url.searchParams.get("tipo"); // Nuevo parámetro para distinguir el tipo de búsqueda
  if (!query) {
    return new Response(
      JSON.stringify({ error: "falta el parametro de busqueda" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    let resultados;
    
    if (tipo === "codigoBarra") {
      // Búsqueda exacta para código de barra
      resultados = await db
        .select()
        .from(productos)
        .where(eq(productos.codigoBarra, query));
    } else {
      // Búsqueda parcial para los demás campos
      resultados = await db
        .select()
        .from(productos)
        .where(
          or(
            like(productos.codigoBarra, `%${query}%`),
            like(productos.descripcion, `%${query}%`),
            like(productos.categoria, `%${query}%`),
            like(productos.marca, `%${query}%`),
            like(productos.modelo, `%${query}%`),
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

export const DELETE: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("search");
  try {
      const [eliminarMovimiento]=await db
        .delete(movimientosStock)
        .where(eq(movimientosStock.productoId, query)).returning()
        // hay q ver si eliminar o anular el producto, cosa q no borre los regustos de ventas
      const [eliminarDetallesVentas]=await db
        .delete(detalleVentas)
        .where(eq(detalleVentas.productoId, query)).returning()
      const [eliminarStock]=await db.delete(stockActual).where(eq(stockActual.productoId, query)).returning()
      const [eliminarProducto]=await db.delete(productos).where(eq(productos.id, query)).returning()

    console.log(eliminarProducto);
    // Invalida el caché de productos para este usuario
    await cache.invalidate(`stock_data_${eliminarProducto.userId}`);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Prodcuto eliminado",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Eliminar producto",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  const data = await request.json();
  const url = new URL(request.url);
  const query = url.searchParams.get("search");

  try {
      const [actualizarProducto] = await db
        .update(productos)
        .set(data)
        .where(eq(productos.id, query))
        .returning();
      await db.update(stockActual).set({
        deposito: data.deposito,
        alertaStock: data.alertaStock,
        localizacion: data.localizacion,
      }).where(eq(stockActual.productoId, query))

    // Invalida el caché de productos para este usuario
await cache.invalidate(`stock_data_${actualizarProducto.userId}`);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "producto actualizado",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
// Invalida el caché de productos para este usuario
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "error al actualizar producto",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
