import type { APIContext } from 'astro';
import db from '../../../db';
import { sesionesCaja, movimientosCaja } from '../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ msg: 'No autorizado' }), { status: 401 });
    }

    const data = await request.json();
    const montoFinalReal = Number(data.montoFinalReal); // Lo que el cajero cuenta

    if (isNaN(montoFinalReal)) {
      return new Response(JSON.stringify({ msg: 'Monto final inválido' }), { status: 400 });
    }

    // 1. Buscar sesión activa
    const [sesionActiva] = await db
      .select()
      .from(sesionesCaja)
      .where(and(
        eq(sesionesCaja.usuarioAperturaId, user.id),
        eq(sesionesCaja.empresaId, user.empresaId),
        eq(sesionesCaja.estado, 'abierta')
      ))
      .limit(1);

    if (!sesionActiva) {
      return new Response(JSON.stringify({ msg: 'No tienes una caja abierta para cerrar.' }), { status: 400 });
    }

    // 2. Calcular monto esperado (Inicial + Ingresos - Egresos)
    const movimientos = await db
      .select({
        tipo: movimientosCaja.tipo,
        total: sql<number>`sum(${movimientosCaja.monto})`.mapWith(Number)
      })
      .from(movimientosCaja)
      .where(eq(movimientosCaja.sesionCajaId, sesionActiva.id))
      .groupBy(movimientosCaja.tipo);

    let totalIngresos = 0;
    let totalEgresos = 0;

    movimientos.forEach(m => {
      if (m.tipo === 'ingreso') totalIngresos = m.total;
      if (m.tipo === 'egreso') totalEgresos = m.total;
    });

    const montoFinalEsperado = (sesionActiva.montoInicial || 0) + totalIngresos - totalEgresos;
    const diferencia = montoFinalReal - montoFinalEsperado;

    // 3. Cerrar Sesión
    await db.update(sesionesCaja)
      .set({
        fechaCierre: new Date(),
        usuarioCierreId: user.id,
        montoFinalEsperado,
        montoFinalReal,
        diferencia,
        estado: 'cerrada'
      })
      .where(eq(sesionesCaja.id, sesionActiva.id));

    return new Response(JSON.stringify({
      msg: 'Caja cerrada correctamente',
      resumen: {
        esperado: montoFinalEsperado,
        real: montoFinalReal,
        diferencia
      }
    }));

  } catch (error) {
    console.error('Error al cerrar caja:', error);
    return new Response(JSON.stringify({ msg: 'Error interno' }), { status: 500 });
  }
}
