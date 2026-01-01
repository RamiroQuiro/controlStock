import type { APIContext } from 'astro';
import db from '../../../db';
import { sesionesCaja, movimientosCaja, cajas, usuariosDepositos, depositos } from '../../../db/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { normalizadorUUID } from '../../../utils/normalizadorUUID';
import { nanoid } from 'nanoid';

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ msg: 'No autorizado' }), { status: 401 });
    }

    const data = await request.json();
    const montoInicial = Number(data.montoInicial) || 0;

    // 0. Obtener el depósito actual del usuario o el principal
    const [userDep] = await db
      .select({ id: depositos.id, nombre: depositos.nombre })
      .from(usuariosDepositos)
      .innerJoin(depositos, eq(usuariosDepositos.depositoId, depositos.id))
      .where(eq(usuariosDepositos.usuarioId, user.id))
      .limit(1);

    let depositoDestinoId = userDep?.id;

    if (!depositoDestinoId) {
      const [depPrincipal] = await db
        .select({ id: depositos.id })
        .from(depositos)
        .where(and(eq(depositos.empresaId, user.empresaId), eq(depositos.principal, true)))
        .limit(1);
      depositoDestinoId = depPrincipal?.id;
    }

    // 1. Verificar si ya tiene caja abierta
    const [sesionActiva] = await db
      .select()
      .from(sesionesCaja)
      .where(and(
        eq(sesionesCaja.usuarioAperturaId, user.id),
        eq(sesionesCaja.empresaId, user.empresaId),
        eq(sesionesCaja.estado, 'abierta')
      ))
      .limit(1);

    if (sesionActiva) {
      return new Response(JSON.stringify({ msg: 'Ya tienes una caja abierta.' }), { status: 400 });
    }

    // 2. Obtener o crear Caja Física para este depósito
    let [cajaFisica] = await db
      .select()
      .from(cajas)
      .where(and(
        eq(cajas.empresaId, user.empresaId), 
        eq(cajas.activa, true),
        depositoDestinoId ? eq(cajas.depositoId, depositoDestinoId) : sql`1=1`
      ))
      .limit(1);

    if (!cajaFisica) {
      // Crear caja por defecto para este depósito si no existe
      const nuevoId = normalizadorUUID('caja');
      await db.insert(cajas).values({
        id: nuevoId,
        nombre: userDep ? `Caja ${userDep.nombre}` : 'Caja Principal',
        empresaId: user.empresaId,
        depositoId: depositoDestinoId,
        creadoPor: user.id
      });
      cajaFisica = { id: nuevoId } as any;
    }

    // 3. Abrir Sesión (Transaction)
    await db.transaction(async (trx) => {
      const sesionId = normalizadorUUID('sesion');
      
      // Crear Sesión
      await trx.insert(sesionesCaja).values({
        id: sesionId,
        cajaId: cajaFisica.id,
        usuarioAperturaId: user.id,
        fechaApertura: new Date(),
        montoInicial: montoInicial,
        estado: 'abierta',
        empresaId: user.empresaId
      });

      // Registrar movimiento de apertura (si hubo monto inicial)
      if (montoInicial >= 0) { // Incluso si es 0, para registro
        await trx.insert(movimientosCaja).values({
          id: normalizadorUUID('movCaja'),
          sesionCajaId: sesionId,
          tipo: 'ingreso',
          origen: 'apertura',
          monto: montoInicial,
          descripcion: 'Apertura de Caja',
          usuarioId: user.id,
          fecha: new Date(),
          empresaId: user.empresaId
        });
      }
    });

    return new Response(JSON.stringify({ msg: 'Caja abierta correctamente' }));

  } catch (error) {
    console.error('Error al abrir caja:', error);
    return new Response(JSON.stringify({ msg: 'Error interno al abrir caja' }), { status: 500 });
  }
}
