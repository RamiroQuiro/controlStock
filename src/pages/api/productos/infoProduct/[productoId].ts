import type { APIRoute } from "astro";
import db from "../../../../db";
import {
  clientes,
  movimientosStock,
  productos,
  proveedores,
  stockActual,
} from "../../../../db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const GET: APIRoute = async ({ params }) => {
  const { productoId } = params;

  if (!productoId) {
    return new Response(JSON.stringify({ error: "ID del producto no proporcionado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const [productDataRaw, stockMovimientoRaw] = await Promise.all([
      db
        .select({
          id: productos.id,
          creadoPor: productos.creadoPor,
          descripcion: productos.descripcion,
          stock: productos.stock,
          categoria: productos.categoria,
          marca: productos.marca,
          isEcommerce:productos.isEcommerce,
          srcPhoto: productos.srcPhoto,
          codigoBarra: productos.codigoBarra,
          unidadMedida: productos.unidadMedida,
          creado: productos.created_at,
          ultimaActualizacion: productos.ultimaActualizacion,
          pCompra: productos.pCompra,
          pVenta: productos.pVenta,
          iva: productos.iva,
          impuesto: productos.impuesto,
          signoDescuento: productos.signoDescuento,
          descuento: productos.descuento,
          modelo: productos.modelo,
          alertaStock: stockActual.alertaStock,
          cantidadReservada: stockActual.reservado,
          localizacion: stockActual.localizacion,
          deposito: stockActual.deposito,
        })
        .from(productos)
        .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
        .where(eq(productos.id, productoId))
        .limit(1),

      db
        .select({
          id: movimientosStock.id,
          tipo: movimientosStock.tipo,
          cantidad: movimientosStock.cantidad,
          motivo: movimientosStock.motivo,
          proveedorNombre: proveedores.nombre,
          clienteNombre: clientes.nombre,
          fecha: movimientosStock.fecha,
        })
        .from(movimientosStock)
        .leftJoin(proveedores, eq(proveedores.id, movimientosStock.proveedorId))
        .leftJoin(clientes, eq(clientes.id, movimientosStock.clienteId))
        .where(eq(movimientosStock.productoId, productoId))
        .orderBy(desc(movimientosStock.fecha)),
    ]);

    const productData = productDataRaw?.[0] ?? null;
    const stockMovimiento = stockMovimientoRaw.map((mov) => ({
      id: mov.id,
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      motivo: mov.motivo,
      fecha: mov.fecha,
      nombreResponsable:
        mov.proveedorNombre || mov.clienteNombre || "Sistema",
      tipoResponsable: mov.proveedorNombre
        ? "Proveedor"
        : mov.clienteNombre
        ? "Cliente"
        : "Sistema",
    }));

    return new Response(
      JSON.stringify({
        status: 200,
        data: {
          productData,
          stockMovimiento,
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
