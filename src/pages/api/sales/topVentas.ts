import type { APIRoute } from 'astro';
import db from '../../../db';
import {
  productos,
  stockActual,
  ventas,
  detalleVentas,
} from '../../../db/schema';
import { and, eq, sql, desc, gte, lte } from 'drizzle-orm';
import { getInicioYFinDelAnioActual, getInicioYFinDeMesActual } from '../../../utils/timeUtils';

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request }) => {
  const empresaId = request.headers.get('xx-empresa-id');
  const filtro = request.headers.get('filtro-selector') || 'mesActual';

  if (!empresaId) {
    return new Response(JSON.stringify({ msg: 'ID de empresa no proporcionado', status: 400 }), { status: 400 });
  }
  
  try {
    let condicionFecha;

    // Se determina la condición de fecha según el filtro, volviendo al enfoque original
    if (filtro === 'mesActual') {
      const { inicio, fin } = getInicioYFinDeMesActual();
      condicionFecha = and(
        gte(ventas.fecha, new Date(inicio * 1000)),
        lte(ventas.fecha, new Date(fin * 1000))
      );
    } else if (filtro === 'ultimos6Meses') {
      const hoy = new Date();
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
      condicionFecha = gte(ventas.fecha, inicio);
    } else { // Por defecto o si es 'anioActual'
      const { inicio, fin } = getInicioYFinDelAnioActual();
      condicionFecha = and(
        gte(ventas.fecha, new Date(inicio * 1000)),
        lte(ventas.fecha, new Date(fin * 1000))
      );
    }

    const whereClause = and(eq(ventas.empresaId, empresaId), condicionFecha);

    // Primero obtenemos el total de ventas del período para calcular porcentajes
    const [totalVentasPeriodo] = await db
      .select({
        totalCantidad: sql<number>`sum(${detalleVentas.cantidad})`.mapWith(Number),
        totalMonto: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`.mapWith(Number),
      })
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .where(whereClause);

    if (!totalVentasPeriodo || !totalVentasPeriodo.totalCantidad) {
        return new Response(JSON.stringify({ data: [], estadisticas: {}, msg: 'No hay ventas en el período seleccionado', status: 200 }), { status: 200 });
    }

    const topVentasMensual = await db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        descripcion: productos.descripcion,
        stock: productos.stock,
        alertaStock: productos.alertaStock,
        categoria: productos.categoria,
        pVenta: productos.pVenta,
        ubicacion: stockActual.ubicacionesId,
        deposito: stockActual.depositosId,
        cantidadVendida: sql<number>`sum(${detalleVentas.cantidad})`.mapWith(Number),
        totalVendido: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`.mapWith(Number),
        porcentajeCantidad: sql<number>`round((sum(${detalleVentas.cantidad}) * 100.0 / ${totalVentasPeriodo.totalCantidad}), 2)`.mapWith(Number),
        porcentajeMonto: sql<number>`round((sum(${detalleVentas.cantidad} * ${detalleVentas.precio}) * 100.0 / ${totalVentasPeriodo.totalMonto}), 2)`.mapWith(Number),
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(whereClause)
      .groupBy(productos.id)
      .orderBy(desc(sql`sum(${detalleVentas.cantidad})`))
      .limit(10);

    // Calculamos estadísticas adicionales
    const estadisticas = {
      totalProductosVendidos: totalVentasPeriodo.totalCantidad,
      montoTotalVentas: totalVentasPeriodo.totalMonto,
      promedioVentaPorProducto: totalVentasPeriodo.totalCantidad > 0 ? totalVentasPeriodo.totalCantidad / topVentasMensual.length : 0,
      productoMasVendido: topVentasMensual[0] || null,
    };

    return new Response(
      JSON.stringify({
        data: topVentasMensual,
        estadisticas,
        msg: 'peticion ok',
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        msg: 'error al obtener estadistica',
        status: 500,
      }),
      { status: 500 }
    );
  }
};