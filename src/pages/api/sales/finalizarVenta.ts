import type { APIContext } from "astro";
import db from "../../../db";
import {
  comprobanteNumeracion,
  comprobantes,
  detalleVentas,
  empresas,
  movimientosStock,
  productos,
  stockActual,
  ventas,
  sesionesCaja,
  movimientosCaja 
} from "../../../db/schema";
import { nanoid } from "nanoid";
import { and, eq, inArray, sql } from "drizzle-orm";
import { agregarCeros } from "../../../lib/calculos";

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const {
      productos: productosSeleccionados,
      userId,
      data,
    } = await request.json();
    const { user } = locals;
    const empresaId = user?.empresaId;
    let clienteId = data.clienteId || user?.clienteDefault;

    if (
      !productosSeleccionados?.length ||
      !empresaId ||
      !userId ||
      !data ||
      !clienteId
    ) {
      return new Response(
        JSON.stringify({ status: 400, msg: "Datos inválidos o incompletos." }),
        { status: 400 }
      );
    }

    if (data.total <= 0) {
      return new Response(
        JSON.stringify({
          status: 402,
          msg: "El monto total debe ser mayor a 0",
        }),
        { status: 402 }
      );
    }

    // --- OPTIMIZACIÓN 1: Chequear stock en Bulk (1 sola query) ---
    const productIds = productosSeleccionados.map((p) => p.id);
    const stockExistenteDB = await db
      .select({ productoId: stockActual.productoId, stock: stockActual.cantidad })
      .from(stockActual)
      .where(inArray(stockActual.productoId, productIds));

    // Validar en local
    for (const prod of productosSeleccionados) {
      const dbItem = stockExistenteDB.find((s) => s.productoId === prod.id);
      if (!dbItem || dbItem.stock < prod.cantidad) {
        return new Response(
          JSON.stringify({
            status: 409,
            msg: `Stock insuficiente para ${prod.nombre}. Stock: ${dbItem?.stock || 0}`,
          }),
          { status: 409 }
        );
      }
    }

    const fechaVenta = new Date();

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
            eq(comprobanteNumeracion.tipo, data.tipoComprobante || "FC_B"),
            eq(comprobanteNumeracion.puntoVenta, data.puntoVenta)
          )
        )
        .returning({ numeroActual: comprobanteNumeracion.numeroActual });

      if (!numeracion) {
        throw new Error(
          "No se encontró o no se pudo actualizar la numeración para el tipo de comprobante."
        );
      }

      const nuevoNumero = numeracion.numeroActual;
      const numeroFormateado = `${data.tipoComprobante || "FC_B"}-${agregarCeros(data.puntoVenta, 4)}-${agregarCeros(nuevoNumero, 8)}`;

      const [comprobanteCreado] = await trx
        .insert(comprobantes)
        .values({
          id: nanoid(12),
          empresaId,
          tipo: data.tipoComprobante || "FC_B",
          puntoVenta: data.puntoVenta,
          numero: nuevoNumero,
          numeroFormateado,
          fecha: fechaVenta,
          fechaEmision: fechaVenta,
          clienteId,
          total: data.total,
          estado: "emitido",
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
          tipo: data.tipoComprobante || "FC_B",
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

      // --- OPTIMIZACIÓN 2: Inserciones en lote (Bulk Inserts) ---
      const detallesValues = productosSeleccionados.map((prod: any) => ({
        id: nanoid(),
        ventaId: ventaFinalizada.id,
        productoId: prod.id,
        empresaId,
        nComprobante: numeroFormateado,
        cantidad: prod.cantidad,
        precio: prod.pVenta,
        subtotal: prod.cantidad * prod.pVenta,
      }));
      await trx.insert(detalleVentas).values(detallesValues);

      // --- OPTIMIZACIÓN 3: Bulk Update de Stock usando subconsultas o Promise.all plano ---
      // Drizzle SQLite bulk update no mapea limpio, así que usamos Promise.all pero ahora que la DB es replica local no ahoga.
      await Promise.all(
        productosSeleccionados.map((prod: any) =>
          trx
            .update(stockActual)
            .set({
              cantidad: sql`${stockActual.cantidad} - ${prod.cantidad}`,
              updatedAt: sql`(strftime('%s','now'))`,
            })
            .where(eq(stockActual.productoId, prod.id))
        )
      );

      // --- OPTIMIZACIÓN 4: Movimientos Stock en Bulk ---
      const movimientosValues = productosSeleccionados.map((prod: any) => ({
        id: nanoid(12),
        productoId: prod.id,
        cantidad: prod.cantidad,
        tipo: "egreso",
        fecha: fechaVenta,
        userId,
        empresaId,
        motivo: "venta",
        clienteId,
        nComprobante: numeroFormateado,
      }));
      await trx.insert(movimientosStock).values(movimientosValues);

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

      // 5. Registrar movimiento en Caja (Solo si es efectivo y hay caja abierta)
      if (data.metodoPago === 'efectivo') {
        const [sesionCajaActiva] = await trx
          .select()
          .from(sesionesCaja)
          .where(and(
            eq(sesionesCaja.usuarioAperturaId, userId),
            eq(sesionesCaja.empresaId, empresaId),
            eq(sesionesCaja.estado, 'abierta')
          ))
          .limit(1);

        if (sesionCajaActiva) {
          await trx.insert(movimientosCaja).values({
            id: nanoid(12),
            sesionCajaId: sesionCajaActiva.id,
            tipo: 'ingreso',
            origen: 'venta',
            monto: data.total, // Asumimos total, si hay vuelto/pagaCon se debería ajustar, pero data.total es el monto de venta
            descripcion: `Venta ${numeroFormateado}`,
            referenciaId: ventaFinalizada.id,
            usuarioId: userId,
            fecha: fechaVenta,
            empresaId: empresaId,
            comprobante: numeroFormateado
          });
        }
      }

      return { ...ventaFinalizada, dataEmpresa };
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Venta finalizada con éxito",
        data: ventaDB,
      })
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error al finalizar la venta",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
