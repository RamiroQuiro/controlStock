import type { APIContext } from 'astro';
import db from '../../../db';
import { sesionesCaja, cajas, depositos, users, movimientosCaja } from '../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET({ locals }: APIContext): Promise<Response> {
  try {
    const { user } = locals;
    // Solo admins o roles permitidos deberían ver esto (asumimos lógica de roles por ahora o filtramos por empresa)
    if (!user) {
      return new Response(JSON.stringify({ msg: 'No autorizado' }), { status: 401 });
    }

    // 1. Buscar TODAS las sesiones abiertas de la empresa
    const sesiones = await db
      .select({
        sesion: sesionesCaja,
        caja: cajas,
        deposito: {
          id: depositos.id,
          nombre: depositos.nombre
        },
        usuario: {
            id: users.id,
            nombre: users.nombre
        }
      })
      .from(sesionesCaja)
      .innerJoin(cajas, eq(sesionesCaja.cajaId, cajas.id))
      .leftJoin(depositos, eq(cajas.depositoId, depositos.id))
      .innerJoin(users, eq(sesionesCaja.usuarioAperturaId, users.id))
      .where(and(
        eq(sesionesCaja.empresaId, user.empresaId),
        eq(sesionesCaja.estado, 'abierta')
      ));

    // 2. Calcular saldos para todas las sesiones abiertas de una vez
    const saldos = await db
      .select({
        sesionId: movimientosCaja.sesionCajaId,
        ingresos: sql<number>`SUM(CASE WHEN ${movimientosCaja.tipo} = 'ingreso' THEN ${movimientosCaja.monto} ELSE 0 END)`.mapWith(Number),
        egresos: sql<number>`SUM(CASE WHEN ${movimientosCaja.tipo} = 'egreso' THEN ${movimientosCaja.monto} ELSE 0 END)`.mapWith(Number)
      })
      .from(movimientosCaja)
      .where(sql`${movimientosCaja.sesionCajaId} IN ${sesiones.map(s => s.sesion.id).length > 0 ? sesiones.map(s => s.sesion.id) : ['none']}`)
      .groupBy(movimientosCaja.sesionCajaId);

    const resumen = sesiones.map(s => {
      const saldoSesion = saldos.find(m => m.sesionId === s.sesion.id);
      const ingresos = saldoSesion?.ingresos || 0;
      const egresos = saldoSesion?.egresos || 0;
      const saldoTotal = (s.sesion.montoInicial || 0) + ingresos - egresos;

      return {
        ...s,
        saldoActual: saldoTotal
      };
    });

    return new Response(JSON.stringify(resumen));

  } catch (error) {
    console.error('Error resumen admin:', error);
    return new Response(JSON.stringify({ msg: 'Error interno' }), { status: 500 });
  }
}
