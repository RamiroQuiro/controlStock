import type { APIContext } from 'astro';
import { eq, and, desc } from 'drizzle-orm';
import db from '../../../../db';
import { movimientosCaja, sesionesCaja, users } from '../../../../db/schema';

export async function GET({ params, locals }: APIContext): Promise<Response> {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ msg: 'No autorizado' }), { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ msg: 'ID de sesión requerido' }), { status: 400 });
    }

    // 1. Obtener datos de la sesión (Seguridad: Verificar empresa)
    const [sesion] = await db
        .select()
        .from(sesionesCaja)
        .where(and(eq(sesionesCaja.id, id), eq(sesionesCaja.empresaId, user.empresaId)))
        .limit(1);

    if (!sesion) {
        return new Response(JSON.stringify({ msg: 'Sesión no encontrada' }), { status: 404 });
    }

    // 2. Si NO es admin, verificar que sea SU sesión
    if (user.rol !== 'admin' && sesion.usuarioAperturaId !== user.id) {
         return new Response(JSON.stringify({ msg: 'No tienes permiso para ver esta sesión' }), { status: 403 });
    }

    // 3. Obtener movimientos
    const movimientos = await db
        .select({
            id: movimientosCaja.id,
            tipo: movimientosCaja.tipo,
            origen: movimientosCaja.origen,
            monto: movimientosCaja.monto,
            descripcion: movimientosCaja.descripcion,
            fecha: movimientosCaja.fecha,
            comprobante: movimientosCaja.comprobante,
            usuarioNombre: users.nombre
        })
        .from(movimientosCaja)
        .leftJoin(users, eq(movimientosCaja.usuarioId, users.id))
        .where(eq(movimientosCaja.sesionCajaId, id))
        .orderBy(desc(movimientosCaja.fecha));

    return new Response(JSON.stringify({ sesion, movimientos }));

  } catch (error) {
    console.error('Error al obtener detalle de caja:', error);
    return new Response(JSON.stringify({ msg: 'Error interno' }), { status: 500 });
  }
}
