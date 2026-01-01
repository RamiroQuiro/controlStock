import type { APIContext } from 'astro';
import db from '../../../db';
import { sesionesCaja, movimientosCaja } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { normalizadorUUID } from '../../../utils/normalizadorUUID';

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ msg: 'No autorizado' }), { status: 401 });
    }

    const data = await request.json();
    const { tipo, monto, descripcion } = data; // tipo: 'ingreso' | 'egreso'

    if (!tipo || !monto) {
      return new Response(JSON.stringify({ msg: 'Faltan datos requeridos (tipo, monto)' }), { status: 400 });
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
      return new Response(JSON.stringify({ msg: 'No tienes una caja abierta para registrar movimientos.' }), { status: 400 });
    }

    // 2. Registrar Movimiento
    await db.insert(movimientosCaja).values({
        id: normalizadorUUID('movCaja'),
        sesionCajaId: sesionActiva.id,
        tipo: tipo,
        origen: 'manual', // Movimiento manual por defecto desde este endpoint
        monto: Number(monto),
        descripcion: descripcion || '',
        usuarioId: user.id,
        fecha: new Date(),
        empresaId: user.empresaId
    });

    return new Response(JSON.stringify({ msg: 'Movimiento registrado correctamente' }));

  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return new Response(JSON.stringify({ msg: 'Error interno' }), { status: 500 });
  }
}
