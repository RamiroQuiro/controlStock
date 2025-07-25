import type { APIContext } from 'astro';
import db from '../../../db';

import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import {
  comprobanteNumeracion,
  comprobantes,
  detallePresupuesto,
  empresas,
  presupuesto,
} from '../../../db/schema';
import { agregarCeros } from '../../../lib/calculos';
import { Temporal } from 'temporal-polyfill';
import { getFechaUnix } from '../../../utils/timeUtils';

export async function POST({ request, params }: APIContext): Promise<Response> {
  try {
    const {
      productos: productosSeleccionados,
      userId,
      empresaId,
      data,
    } = await request.json();

    // Validaciones previas
    if (!productosSeleccionados?.length || !userId || !data.clienteId) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: 'Datos inválidos o incompletos',
        }),
        { status: 400 }
      );
    }

    if (data.total <= 0) {
      return new Response(
        JSON.stringify({
          status: 402,
          msg: 'El monto total del presupuesto debe ser mayor a 0',
        }),
        { status: 402 }
      );
    }

    // Calcular fecha de expiración (5 días)
    const diasExpiracion = 5; // Variable para los días de expiración
    const fecha = new Date(getFechaUnix() * 1000);
    const expira_at = new Date(fecha.setDate(fecha.getDate() + diasExpiracion));

    const presupuestoDB = await db
      .transaction(async (trx) => {
        // Generar código único para el presupuesto
        const codigo = nanoid(8).toUpperCase();
        // obtener numeracion anterior
        const [numeracion] = await trx
          .select()
          .from(comprobanteNumeracion)
          .where(
            and(
              eq(comprobanteNumeracion.empresaId, empresaId),
              eq(comprobanteNumeracion.tipo, 'PRESUPUESTO'),
              eq(comprobanteNumeracion.puntoVenta, data.puntoVenta)
            )
          );
        const nuevoNumero = numeracion.numeroActual + 1;
        const numeroFormateado = `${'PRESUPUESTO'}-${agregarCeros(data.puntoVenta, 4)}-${agregarCeros(nuevoNumero, 8)}`;

        // Actualizar numeración
        await trx
          .update(comprobanteNumeracion)
          .set({
            numeroActual: nuevoNumero,
            updatedAt: fecha,
          })
          .where(
            and(
              eq(comprobanteNumeracion.empresaId, empresaId),
              eq(comprobanteNumeracion.tipo, 'PRESUPUESTO'),
              eq(comprobanteNumeracion.puntoVenta, data.puntoVenta)
            )
          );
        // Crear comprobante
        const [comprobanteCreado] = await trx
          .insert(comprobantes)
          .values({
            id: nanoid(12),
            empresaId,
            tipo: 'PRESUPUESTO',
            puntoVenta: data.puntoVenta,
            numero: nuevoNumero,
            numeroFormateado,
            fecha: fecha,
            fechaEmision: fecha,
            clienteId: data.clienteId,
            total: data.total,
            estado: 'emitido',
          })
          .returning();

        const presupuestoFinalizado = await trx
          .insert(presupuesto)
          .values({
            id: nanoid(12),
            codigo,
            userId,
            empresaId,
            fecha: fecha,
            puntoVenta: data.puntoVenta,
            tipoComprobante: 'PRESUPUESTO',
            numeroFormateado,
            comprobanteId: comprobanteCreado.id,
            nComprobante: numeroFormateado,
            expira_at: expira_at,
            estado: 'activo',
            ...data,
          })
          .returning();

        // Procesar cada producto del presupuesto
        await Promise.all(
          productosSeleccionados.map(async (prod) => {
            await trx.insert(detallePresupuesto).values({
              id: nanoid(),
              nComprobante: numeroFormateado,
              presupuestoId: presupuestoFinalizado[0].id,
              productoId: prod.id,
              cantidad: prod.cantidad,
              precioUnitario: prod.pVenta,
              subtotal: prod.cantidad * prod.pVenta,
              impuesto: prod.iva || 0,
              descuento: prod.descuento || 0,
            });
          })
        );

        const [dataEmpresa] = await trx
          .select({
            razonSocial: empresas.razonSocial,
            documento: empresas.documento,
            direccion: empresas.direccion,
            telefono: empresas.telefono,
            logo: empresas.srcPhoto,
            email: empresas.email,
          })
          .from(empresas)
          .where(eq(empresas.id, empresaId));

        return {
          ...presupuestoFinalizado[0],
          dataEmpresa,
        };
      })
      .catch((error) => {
        console.error('Error en transacción:', error);
        throw error;
      });
    // console.log('este es el endpoint presupuestar ->', presupuestoDB);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Presupuesto generado con éxito',
        data: presupuestoDB,
      })
    );
  } catch (error) {
    console.error('Error al generar presupuesto:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error al generar el presupuesto',
      }),
      { status: 500 }
    );
  }
}
