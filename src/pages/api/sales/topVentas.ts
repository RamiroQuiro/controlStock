import type { APIRoute } from "astro";
import db from "../../../db";
import {
  productos,
  stockActual,
  ventas,
  detalleVentas,
} from "../../../db/schema";
import { and, eq, sql, desc } from "drizzle-orm";

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request }) => {
  const userId = request.headers.get("x-user-id");
  const filtroSelector = request.headers.get("filtro-selector") || "mesActual";

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
  const añoActual = fechaActual.getFullYear();

  let condicionFecha;

  switch (filtroSelector) {
    case "mesActual":
      condicionFecha = sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch')) = ${mesActual.toString().padStart(2, "0")} AND strftime('%Y', datetime(${ventas.fecha}, 'unixepoch')) = ${añoActual.toString()}`;
      break;
    case "mesAnterior":
      condicionFecha = sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch')) = ${mesAnterior.toString().padStart(2, "0")} AND strftime('%Y', datetime(${ventas.fecha}, 'unixepoch')) = ${añoActual.toString()}`;
      break;
    case "añoActual":
      condicionFecha = sql`strftime('%Y', datetime(${ventas.fecha}, 'unixepoch')) = ${añoActual.toString()}`;
      break;
    default:
      condicionFecha = sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch')) = ${mesActual.toString().padStart(2, "0")}`;
  }

console.log('este es el filtro ->',filtroSelector)

  try {
    // Primero obtenemos el total de ventas del período para calcular porcentajes
    const totalVentasPeriodo = await db
      .select({
        totalCantidad: sql<number>`sum(${detalleVentas.cantidad})`,
        totalMonto: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`
      })
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .where(and(eq(productos.userId, userId), condicionFecha))
      .get();

    const topVentasMensual = await db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        descripcion: productos.descripcion,
        stock: productos.stock,
        alertaStock: productos.alertaStock,
        categoria: productos.categoria,
        pVenta: productos.pVenta,
        ubicacion: stockActual.localizacion,
        deposito: stockActual.deposito,
        cantidadVendida: sql<number>`sum(${detalleVentas.cantidad})`,
        totalVendido: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`,
        porcentajeCantidad: sql<number>`round((sum(${detalleVentas.cantidad}) * 100.0 / ${totalVentasPeriodo.totalCantidad}), 2)`,
        porcentajeMonto: sql<number>`round((sum(${detalleVentas.cantidad} * ${detalleVentas.precio}) * 100.0 / ${totalVentasPeriodo.totalMonto}), 2)`
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(and(eq(productos.userId, userId), condicionFecha))
      .groupBy(productos.id)
      .orderBy(desc(sql`sum(${detalleVentas.cantidad})`))
      .limit(10);

    // Calculamos estadísticas adicionales
    const estadisticas = {
      totalProductosVendidos: totalVentasPeriodo.totalCantidad,
      montoTotalVentas: totalVentasPeriodo.totalMonto,
      promedioVentaPorProducto: totalVentasPeriodo.totalCantidad / topVentasMensual.length,
      productoMasVendido: topVentasMensual[0]
    };

    return new Response(
      JSON.stringify({
        data: topVentasMensual,
        msg: "peticion ok",
        status: 200,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        msg: "error al obtener estadistica",
        status: 404,
      }),
      {
        status: 404,
      }
    );
  }
};
