import type { APIRoute } from "astro";
import db from "../../../../db";
import { clientes, movimientosStock, productos, proveedores, stockActual } from "../../../../db/schema";
import { desc, eq, sql } from "drizzle-orm";

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
          unidadMedida:productos.unidadMedida,
          creado:productos.created_at,
          ultimaActualizacion:productos.ultimaActualizacion,
          pCompra: productos.pCompra,
          pVenta: productos.pVenta,
          iva:productos.iva,
          alertaStock: stockActual.alertaStock,
          impuesto:productos.impuesto,
          signoDescuento:productos.signoDescuento,
          descuento:productos.descuento,
          modelo:productos.modelo,
          cantidadReservada: stockActual.reservado,
          localizacion: stockActual.localizacion,
          deposito:stockActual.deposito
        })
        .from(productos)
        .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
        .where(eq(productos.id, productoId))).at(0)

      // Consulta modificada para movimientos de stock
      const stockMovimiento = await trx
        .select({
          id: movimientosStock.id,
          tipo: movimientosStock.tipo,
          cantidad: movimientosStock.cantidad,
          motivo: movimientosStock.motivo,
          nombreResponsable: sql<string>`
            CASE 
              WHEN ${movimientosStock.proveedorId} IS NOT NULL THEN ${proveedores.nombre}
              WHEN ${movimientosStock.clienteId} IS NOT NULL THEN ${clientes.nombre}
              ELSE 'Sistema'
            END
          `,
          tipoResponsable: sql<string>`
            CASE 
              WHEN ${movimientosStock.proveedorId} IS NOT NULL THEN 'Proveedor'
              WHEN ${movimientosStock.clienteId} IS NOT NULL THEN 'Cliente'
              ELSE 'Sistema'
            END
          `,
          fecha: movimientosStock.fecha,
        })
        .from(movimientosStock)
        .leftJoin(proveedores, eq(proveedores.id, movimientosStock.proveedorId))
        .leftJoin(clientes, eq(clientes.id, movimientosStock.clienteId))
        .where(eq(movimientosStock.productoId, productoId))
        .orderBy(desc(movimientosStock.fecha));

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
