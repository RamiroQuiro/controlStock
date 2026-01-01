import type { APIContext } from 'astro';
import db from '../../../db';
import { sesionesCaja, movimientosCaja, cajas, depositos } from '../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET({ locals }: APIContext): Promise<Response> {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ msg: 'No autorizado' }), { status: 401 });
    }

    // 1. Buscar sesión activa para este usuario en esta empresa
    const [sesionActiva] = await db
      .select({
        sesion: sesionesCaja,
        caja: cajas,
        deposito: {
          id: depositos.id,
          nombre: depositos.nombre
        }
      })
      .from(sesionesCaja)
      .leftJoin(cajas, eq(sesionesCaja.cajaId, cajas.id))
      .leftJoin(depositos, eq(cajas.depositoId, depositos.id))
      .where(and(
        eq(sesionesCaja.usuarioAperturaId, user.id),
        eq(sesionesCaja.empresaId, user.empresaId),
        eq(sesionesCaja.estado, 'abierta')
      ))
      .limit(1);

    if (!sesionActiva) {
      return new Response(JSON.stringify({ 
        estado: 'cerrada',
        msg: 'No hay caja abierta para este usuario.'
      }));
    }

    // 2. Calcular totales de movimientos
    const movimientos = await db
      .select({
        tipo: movimientosCaja.tipo,
        total: sql<number>`sum(${movimientosCaja.monto})`.mapWith(Number)
      })
      .from(movimientosCaja)
      .where(eq(movimientosCaja.sesionCajaId, sesionActiva.sesion.id))
      .groupBy(movimientosCaja.tipo);

    let totalIngresos = 0;
    let totalEgresos = 0;

    movimientos.forEach(m => {
      if (m.tipo === 'ingreso') totalIngresos = m.total;
      if (m.tipo === 'egreso') totalEgresos = m.total;
    });

    const saldoActual = (sesionActiva.sesion.montoInicial || 0) + totalIngresos - totalEgresos;

    return new Response(JSON.stringify({
      estado: 'abierta',
      sesion: {
        ...sesionActiva.sesion,
        caja: sesionActiva.caja,
        deposito: sesionActiva.deposito,
        totalIngresos,
        totalEgresos,
        saldoActual
      }
    }));

  } catch (error) {
    console.error('Error al obtener estado de caja:', error);
    return new Response(JSON.stringify({ msg: 'Error interno' }), { status: 500 });
  }
}
