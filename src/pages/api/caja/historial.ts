import type { APIContext } from 'astro';
import db from '../../../db';
import { sesionesCaja, cajas, depositos, users } from '../../../db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

export async function GET({ request, locals }: APIContext): Promise<Response> {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ msg: 'No autorizado' }), { status: 401 });
    }

    const url = new URL(request.url);
    const fechaDesde = url.searchParams.get('desde');
    const fechaHasta = url.searchParams.get('hasta');
    const usuarioId = url.searchParams.get('usuarioId');

    // Construcción dinámica de filtros
    const filters = [eq(sesionesCaja.empresaId, user.empresaId)];

    // Validar que no sean strings vacíos
    if (fechaDesde && fechaDesde !== '' && fechaHasta && fechaHasta !== '') {
        // Asumiendo que vienen en formato YYYY-MM-DD o ISO
        const dateDesde = new Date(fechaDesde);
        const dateHasta = new Date(fechaHasta);
        
        if (!isNaN(dateDesde.getTime()) && !isNaN(dateHasta.getTime())) {
            dateHasta.setHours(23, 59, 59, 999); // Final del día
            filters.push(gte(sesionesCaja.fechaApertura, dateDesde));
            filters.push(lte(sesionesCaja.fechaApertura, dateHasta));
        }
    }

    // Filtro a nivel de UI si es admin, pero a nivel de DB también es bueno
    // Si no es admin, solo ve sus propias cajas (opcional, por ahora dejamos que admin vea todo y usuario vea suyas si quiere)
    if (usuarioId && user.rol === 'admin') {
        filters.push(eq(sesionesCaja.usuarioAperturaId, usuarioId));
    } else if (user.rol !== 'admin') {
        // Vendedor solo ve sus cajas
        filters.push(eq(sesionesCaja.usuarioAperturaId, user.id));
    }

    // console.log('Filters:', filters); 
    const historial = await db
      .select({
        id: sesionesCaja.id,
        fechaApertura: sesionesCaja.fechaApertura,
        fechaCierre: sesionesCaja.fechaCierre,
        estado: sesionesCaja.estado,
        montoInicial: sesionesCaja.montoInicial,
        montoFinalReal: sesionesCaja.montoFinalReal,
        diferencia: sesionesCaja.diferencia,
        cajaNombre: cajas.nombre,
        depositoNombre: depositos.nombre,
        usuarioNombre: users.nombre,
        usuarioApellido: users.apellido
      })
      .from(sesionesCaja)
      .innerJoin(cajas, eq(sesionesCaja.cajaId, cajas.id))
      .leftJoin(depositos, eq(cajas.depositoId, depositos.id))
      .innerJoin(users, eq(sesionesCaja.usuarioAperturaId, users.id))
      .where(and(...filters))
      .orderBy(desc(sesionesCaja.fechaApertura))
      .limit(50); 
      
    // console.log('Resultados encontrados:', historial.length);

    return new Response(JSON.stringify(historial));

  } catch (error) {
    console.error('Error al obtener historial de cajas:', error);
    return new Response(JSON.stringify({ msg: 'Error interno' }), { status: 500 });
  }
}
