import type { APIRoute } from 'astro';
import db from '../../../db';
import {
  productos,
  stockActual,
  ventas,
  detalleVentas,
} from '../../../db/schema';
import { and, eq, sql, desc, gte, lte } from 'drizzle-orm';

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request }) => {
  const userId = request.headers.get('x-user-id');
  const empresaId = request.headers.get('xx-empresa-id');
  const filtro = request.headers.get('filtro-selector') || 'mesActual';

  try {
    const now = new Date();
    const año = now.getFullYear();
    const mes = now.getMonth(); // 0-indexed
    let condicionFecha;
    let etiquetas: string[] = [];

    if (filtro === 'mesActual') {
      const inicioMes = new Date(año, mes, 1);
      const finMes = new Date(año, mes + 1, 0, 23, 59, 59);
      condicionFecha = and(
        eq(ventas.empresaId, empresaId),
        lte(ventas.fecha, finMes),
        gte(ventas.fecha, inicioMes)
      );
      const dias = new Date(año, mes + 1, 0).getDate();
      etiquetas = Array.from({ length: dias }, (_, i) => `${i + 1}`);
    } else if (filtro === 'ultimos6Meses') {
      const inicio = new Date(año, mes - 5, 1);
      condicionFecha = and(
        eq(ventas.empresaId, empresaId),
        gte(ventas.fecha, inicio)
      );
    } else {
      const inicioAño = new Date(año, 0, 1);
      condicionFecha = and(
        eq(ventas.empresaId, empresaId),
        gte(ventas.fecha, inicioAño),
        lte(ventas.fecha, now)
      );
    }

    // Primero obtenemos el total de ventas del período para calcular porcentajes
    const totalVentasPeriodo = await db
      .select({
        totalCantidad: sql<number>`sum(${detalleVentas.cantidad})`,
        totalMonto: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`,
      })
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .where(and(eq(productos.empresaId, empresaId), condicionFecha))
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
        porcentajeMonto: sql<number>`round((sum(${detalleVentas.cantidad} * ${detalleVentas.precio}) * 100.0 / ${totalVentasPeriodo.totalMonto}), 2)`,
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(and(eq(productos.empresaId, empresaId), condicionFecha))
      .groupBy(productos.id)
      .orderBy(desc(sql`sum(${detalleVentas.cantidad})`))
      .limit(10);

    // Calculamos estadísticas adicionales
    const estadisticas = {
      totalProductosVendidos: totalVentasPeriodo.totalCantidad,
      montoTotalVentas: totalVentasPeriodo.totalMonto,
      promedioVentaPorProducto:
        totalVentasPeriodo.totalCantidad / topVentasMensual.length,
      productoMasVendido: topVentasMensual[0],
    };

    return new Response(
      JSON.stringify({
        data: topVentasMensual,
        estadisticas,
        msg: 'peticion ok',
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
        msg: 'error al obtener estadistica',
        status: 404,
      }),
      {
        status: 404,
      }
    );
  }
};
