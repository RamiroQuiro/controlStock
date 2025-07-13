import type { APIRoute } from 'astro';
import { ventas } from '../../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import db from '../../../db';

export const GET: APIRoute = async ({ request }) => {
  const userId = request.headers.get('x-user-id');
  const empresaId = request.headers.get('xx-empresa-id');
  const filtro = request.headers.get('filtro-selector') || 'añoActual';

  if (!userId || !empresaId || empresaId === 'null' || empresaId === 'undefined') {
    return new Response(JSON.stringify({ msg: 'Falta empresa o usuario', status: 400 }), { status: 400 });
  }

  try {
    const now = new Date();
    const año = now.getFullYear();
    const mes = now.getMonth(); // 0-indexed
    let condicionFecha;
    let etiquetas: string[] = [];
    let agruparPor;

    if (filtro === 'mesActual') {
      const inicioMes = new Date(año, mes, 1);
      const finMes = new Date(año, mes + 1, 0, 23, 59, 59);
      condicionFecha = and(
        eq(ventas.empresaId, empresaId),
        gte(ventas.fecha, Math.floor(inicioMes.getTime())),
        lte(ventas.fecha, Math.floor(finMes.getTime()))
      );
      agruparPor = sql`strftime('%d', datetime(${ventas.fecha} / 1000, 'unixepoch'))`;
      const dias = new Date(año, mes + 1, 0).getDate();
      etiquetas = Array.from({ length: dias }, (_, i) => `${i + 1}`);
    } else if (filtro === 'ultimos6Meses') {
      const inicio = new Date(año, mes - 5, 1);
      condicionFecha = and(
        eq(ventas.empresaId, empresaId),
        gte(ventas.fecha, Math.floor(inicio.getTime()))
      );
      agruparPor = sql`strftime('%m', datetime(${ventas.fecha} / 1000, 'unixepoch'))`;
      etiquetas = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(año, mes - 5 + i, 1);
        return d.toLocaleString('es', { month: 'short' });
      });
    } else {
      const inicioAño = new Date(año, 0, 1);
      condicionFecha = and(
        eq(ventas.empresaId, empresaId),
        gte(ventas.fecha, Math.floor(inicioAño.getTime() )),
        lte(ventas.fecha, Math.floor(now.getTime() ))
      );
      agruparPor = sql`strftime('%m', datetime(${ventas.fecha} / 1000, 'unixepoch'))`;
      etiquetas = Array.from({ length: mes + 1 }, (_, i) => {
        const d = new Date(año, i, 1);
        return d.toLocaleString('es', { month: 'short' });
      });
    }

   
    const resultados = await db.select({
      periodo: agruparPor.as('periodo'),
      total: sql<number>`sum(${ventas.total})`.as('total'),
      cantidad: sql<number>`count(*)`.as('cantidad'),
    })
    .from(ventas)
    .where(condicionFecha)
    .groupBy(agruparPor)
    .orderBy(agruparPor);
  



    const montosPorPeriodo = etiquetas.map((_, i) => {
      const periodoBuscado = filtro === 'mesActual'
        ? String(i + 1).padStart(2, '0')
        : (new Date(año, mes - 5 + i, 1).getMonth() + 1).toString().padStart(2, '0');

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
