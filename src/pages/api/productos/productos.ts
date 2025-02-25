import { eq, like, or } from "drizzle-orm";
import {
  detalleVentas,
  movimientosStock,
  productos,
  stockActual,
} from "../../../db/schema";
import db from "../../../db";
import type { APIRoute } from "astro";

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, params }) => {
  // Extraer el `productoId` de los parámetros
  const url = new URL(request.url);
  const query = url.searchParams.get("search");

  // Validación inicial: comprobar si el `productoId` está presente
  if (!query) {
    return new Response(
      JSON.stringify({ error: "fatla el parametro de busqueda" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Inicia una transacción para manejar consultas relacionadas al producto
  try {
    const resultados = await db
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
      )
      

    // console.log(resultados);
    // Respuesta exitosa con los datos obtenidos
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
    const transacciones = await db.transaction(async (trx) => {
      await trx
        .delete(movimientosStock)
        .where(eq(movimientosStock.productoId, query));
      await trx
        .delete(detalleVentas)
        .where(eq(detalleVentas.productoId, query));
      await trx.delete(stockActual).where(eq(stockActual.productoId, query));
      await trx.delete(productos).where(eq(productos.id, query));
    });

    console.log(transacciones);

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
  console.log("est es la actualizacion del producto ->", data, query);

  try {
    const transaccionar = await db.transaction(async (trx) => {
      const actualizarProducto = await trx
        .update(productos)
        .set(data)
        .where(eq(productos.id, query))
        .returning();
      await trx.update(stockActual).set({
        deposito: data.deposito,
        alertaStock: data.alertaStock,
        localizacion: data.localizacion,
      }).where(eq(stockActual.productoId, query))
    });
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
