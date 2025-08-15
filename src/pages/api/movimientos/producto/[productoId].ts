import type { APIRoute } from "astro";

import { eq, desc } from "drizzle-orm";
import { movimientosStock,proveedores,clientes } from "../../../../db/schema";
import db from "../../../../db";

export const GET: APIRoute = async ({ params }) => {
  try {
    const productoId = params.productoId
console.log('enpoint de movimientos ->',productoId)
    if (!productoId) {
      return new Response(
        JSON.stringify({ error: "ID de producto inválido" }),
        { status: 400 }
      );
    }

    const stockMovimientoRaw =await db
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
      .orderBy(desc(movimientosStock.fecha))
      .limit(10)
     
    const stockMovimiento = stockMovimientoRaw.map((mov) => ({
      id: mov.id,
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      motivo: mov.motivo,
      fecha: mov.fecha,
      nombreResponsable: mov.proveedorNombre || mov.clienteNombre || "Sistema",
      tipoResponsable: mov.proveedorNombre
        ? "Proveedor"
        : mov.clienteNombre
          ? "Cliente"
          : "Sistema",
    }));

    return new Response(JSON.stringify({ stockMovimiento }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al obtener historial de movimientos:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 }
    );
  }
};
