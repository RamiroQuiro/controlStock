import type { APIContext } from 'astro';
import db from '../../../db';
import {
  comprobanteNumeracion,
  comprobantes,
  detalleVentas,
  empresas,
  movimientosStock,
  productos,
  stockActual,
  ventas,
} from '../../../db/schema';
import { nanoid } from 'nanoid';
import { and, eq, sql } from 'drizzle-orm';
import { agregarCeros } from '../../../lib/calculos';
import { getFechaUnix } from '../../../utils/timeUtils';

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const {
      productos: productosSeleccionados,
      userId,
      empresaId,
      data,
    } = await request.json();
    const { user } = locals;

    let clienteId = data.clienteId || user?.clienteDefault;

    if (
      !productosSeleccionados?.length ||
      !empresaId ||
      !userId ||
      !data ||
      !clienteId
    ) {
      return new Response(
        JSON.stringify({ status: 400, msg: 'Datos inválidos o incompletos.' }),
        { status: 400 }
      );
    }

    if (data.total <= 0) {
      return new Response(
        JSON.stringify({
          status: 402,
          msg: 'El monto total debe ser mayor a 0',
        }),
        { status: 402 }
      );
    }

    for (const prod of productosSeleccionados) {
      const [productoDB] = await db
        .select({ stock: productos.stock, nombre: productos.nombre })
        .from(productos)
        .where(eq(productos.id, prod.id));
      if (!productoDB || productoDB.stock < prod.cantidad) {
        return new Response(
          JSON.stringify({
            status: 409,
            msg: `Stock insuficiente para ${productoDB?.nombre || prod.nombre}. Stock: ${productoDB?.stock || 0}`,
          }),
          { status: 409 }
        );
      }
    }

    const fechaVenta = new Date(getFechaUnix() * 1000);

    const ventaDB = await db.transaction(async (trx) => {
      const [numeracion] = await trx
        .update(comprobanteNumeracion)
        .set({
          numeroActual: sql`${comprobanteNumeracion.numeroActual} + 1`,
          updatedAt: fechaVenta,
        })
        .where(
          and(
            eq(comprobanteNumeracion.empresaId, empresaId),
            eq(comprobanteNumeracion.tipo, data.tipoComprobante || 'FC_B'),
            eq(comprobanteNumeracion.puntoVenta, data.puntoVenta)
          )
        )
        .returning({ numeroActual: comprobanteNumeracion.numeroActual });

      if (!numeracion) {
        throw new Error(
          'No se encontró o no se pudo actualizar la numeración para el tipo de comprobante.'
        );
      }

      const nuevoNumero = numeracion.numeroActual;
      const numeroFormateado = `${data.tipoComprobante || 'FC_B'}-${agregarCeros(data.puntoVenta, 4)}-${agregarCeros(nuevoNumero, 8)}`;

      const [comprobanteCreado] = await trx
        .insert(comprobantes)
        .values({
          id: nanoid(12),
          empresaId,
          tipo: data.tipoComprobante || 'FC_B',
          puntoVenta: data.puntoVenta,
          numero: nuevoNumero,
          numeroFormateado,
          fecha: fechaVenta,
          fechaEmision: fechaVenta,
          clienteId,
          total: data.total,
          estado: 'emitido',
        })
        .returning();
      const [ventaFinalizada] = await trx
        .insert(ventas)
        .values({
          id: nanoid(12),
          empresaId,
          userId,
          clienteId,
          comprobanteId: comprobanteCreado.id,
          nComprobante: numeroFormateado,
          numeroFormateado,
          puntoVenta: data.puntoVenta,
          tipo: data.tipoComprobante || 'FC_B',
          metodoPago: data.metodoPago,
          fecha: fechaVenta,
          total: data.total,
          impuesto: data.impuesto,
          descuento: data.descuento,
          nCheque: data.nCheque,
          vencimientoCheque: data.vencimientoCheque
            ? new Date(data.vencimientoCheque)
            : null,
        })
        .returning();

      await Promise.all(
        productosSeleccionados.map((prod) =>
          trx.insert(detalleVentas).values({
            id: nanoid(),
            ventaId: ventaFinalizada.id,
            productoId: prod.id,
            nComprobante: numeroFormateado,
            cantidad: prod.cantidad,
            precio: prod.pVenta,
            subtotal: prod.cantidad * prod.pVenta,
          })
        )
      );
      await Promise.all(
        productosSeleccionados.map((prod) =>
          trx
            .update(productos)
            .set({ stock: sql`${productos.stock} - ${prod.cantidad}` })
            .where(eq(productos.id, prod.id))
        )
      );
      await Promise.all(
        productosSeleccionados.map((prod) =>
          trx
            .update(stockActual)
            .set({
              cantidad: sql`${stockActual.cantidad} - ${prod.cantidad}`,
              updatedAt: sql`(strftime('%s','now'))`,
            })
            .where(eq(stockActual.productoId, prod.id))
        )
      );
      await Promise.all(
        productosSeleccionados.map((prod) =>
          trx.insert(movimientosStock).values({
            id: nanoid(12),
            productoId: prod.id,
            cantidad: prod.cantidad,
            tipo: 'egreso',
            fecha: fechaVenta,
            userId,
            empresaId,
            motivo: 'venta',
            clienteId,
            nComprobante: numeroFormateado,
          })
        )
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

      return { ...ventaFinalizada, dataEmpresa };
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Venta finalizada con éxito',
        data: ventaDB,
      })
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error al finalizar la venta',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
