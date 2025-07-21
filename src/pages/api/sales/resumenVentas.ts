import type { APIRoute } from 'astro';
import { ventas } from '../../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import db from '../../../db';
import { getInicioYFinDeMesActual, getInicioYFinDelAnioActual, getUltimosNDias } from '../../../utils/timeUtils';

export const GET: APIRoute = async ({ request }) => {
  const empresaId = request.headers.get('xx-empresa-id');
  const filtro = request.headers.get('filtro-selector') || 'anioActual';

  if (!empresaId || empresaId === 'null' || empresaId === 'undefined') {
    return new Response(JSON.stringify({ msg: 'Falta empresa o usuario', status: 400 }), { status: 400 });
  }

  try {
    let condicionFecha;
    let etiquetas: string[] = [];
    let agruparPor;
    let formatoEtiqueta;

    if (filtro === 'mesActual') {
      const { inicio, fin } = getInicioYFinDeMesActual();
      condicionFecha = and(gte(ventas.fecha, new Date(inicio * 1000)), lte(ventas.fecha, new Date(fin * 1000)));
      agruparPor = sql`strftime('%d', ventas.fecha, 'unixepoch')`;
      const diasDelMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      etiquetas = Array.from({ length: diasDelMes }, (_, i) => `${i + 1}`);
      formatoEtiqueta = (i: number) => String(i + 1).padStart(2, '0');

    } else if (filtro === 'ultimos6Meses') {
      const { desde, hasta } = getUltimosNDias(180); // Aprox. 6 meses
      condicionFecha = and(gte(ventas.fecha, new Date(desde * 1000)), lte(ventas.fecha, new Date(hasta * 1000)));
      agruparPor = sql`strftime('%m', ventas.fecha, 'unixepoch')`;
      etiquetas = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5 + i);
        return d.toLocaleString('es', { month: 'short' });
      });
      formatoEtiqueta = (i: number) => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5 + i);
        return (d.getMonth() + 1).toString().padStart(2, '0');
      };

    } else { // añoActual
      const { inicio, fin } = getInicioYFinDelAnioActual();
      condicionFecha = and(gte(ventas.fecha, new Date(inicio * 1000)), lte(ventas.fecha, new Date(fin * 1000)));
      agruparPor = sql`strftime('%m', ventas.fecha, 'unixepoch')`;
      etiquetas = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString('es', { month: 'short' }));
      formatoEtiqueta = (i: number) => String(i + 1).padStart(2, '0');
    }

    const whereClause = and(eq(ventas.empresaId, empresaId), condicionFecha);

    const resultados = await db.select({
      periodo: agruparPor.as('periodo'),
      total: sql<number>`sum(${ventas.total})`.mapWith(Number),
      cantidad: sql<number>`count(*)`.mapWith(Number),
    })
    .from(ventas)
    .where(whereClause)
    .groupBy(agruparPor)
    .orderBy(agruparPor);

    const montosPorPeriodo = etiquetas.map((_, i) => {
      const periodoBuscado = formatoEtiqueta(i);
      const dato = resultados.find((r) => r.periodo === periodoBuscado);
      return dato ? dato.total : 0;
    });

    const totalVentas = montosPorPeriodo.reduce((sum, val) => sum + val, 0);
    const totalTransacciones = resultados.reduce((sum, r) => sum + r.cantidad, 0);
    const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;

    return new Response(
      JSON.stringify({
        etiquetas,
        montosPorPeriodo,
        ventasTotales: totalVentas,
        ticketPromedio,
        totalTransacciones,
        periodoActual: filtro === 'mesActual' ? 'días' : 'meses',
        status: 200,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    return new Response(JSON.stringify({ msg: 'Error en el servidor', status: 500 }), { status: 500 });
  }
};