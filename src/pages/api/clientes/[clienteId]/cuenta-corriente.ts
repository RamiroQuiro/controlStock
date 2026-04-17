import type { APIContext } from "astro";
import db from "../../../../db";
import { movimientosCuentaCorriente, clientes, movimientosCaja, sesionesCaja, deudasProductos, productos } from "../../../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET({ params, request, locals }: APIContext) {
  const { clienteId } = params;
  const { user } = locals;
  const empresaId = user?.empresaId;

  if (!clienteId || !empresaId) {
    return new Response(JSON.stringify({ msg: "Faltan datos" }), { status: 400 });
  }

  try {
    const movements = await db
      .select()
      .from(movimientosCuentaCorriente)
      .where(
        and(
          eq(movimientosCuentaCorriente.clienteId, clienteId),
          eq(movimientosCuentaCorriente.empresaId, empresaId)
        )
      )
      .orderBy(desc(movimientosCuentaCorriente.fecha));

    // Obtener ítems pendientes con PRECIO ACTUAL
    const pendingItems = await db
      .select({
        id: deudasProductos.id,
        productoId: deudasProductos.productoId,
        nombre: productos.nombre,
        cantidadPendiente: deudasProductos.cantidadPendiente,
        precioOriginal: deudasProductos.precioVentaOriginal,
        precioActual: productos.pVenta,
        fecha: deudasProductos.fecha,
      })
      .from(deudasProductos)
      .innerJoin(productos, eq(deudasProductos.productoId, productos.id))
      .where(
        and(
          eq(deudasProductos.clienteId, clienteId),
          eq(deudasProductos.empresaId, empresaId)
        )
      );

    return new Response(JSON.stringify({ status: 200, movements, pendingItems }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ msg: "Error al obtener movimientos" }), { status: 500 });
  }
}

export async function POST({ params, request, locals }: APIContext) {
  const { clienteId } = params;
  const { user } = locals;
  const empresaId = user?.empresaId;
  const { monto, observaciones, metodoPago } = await request.json();

  if (!clienteId || !empresaId || !monto) {
    return new Response(JSON.stringify({ msg: "Faltan datos requeridos" }), { status: 400 });
  }

  try {
    const result = await db.transaction(async (trx) => {
      // 1. Obtener saldo actual
      const [clienteDB] = await trx
        .select()
        .from(clientes)
        .where(eq(clientes.id, clienteId))
        .limit(1);

      if (!clienteDB) throw new Error("Cliente no encontrado");

      const montoNum = Number(monto);
      const nuevoSaldo = Number(clienteDB.saldoPendiente || 0) - montoNum;

      // 2. Actualizar saldo del cliente
      await trx
        .update(clientes)
        .set({ saldoPendiente: nuevoSaldo })
        .where(eq(clientes.id, clienteId));

      // 3. Registrar movimiento en Cuenta Corriente
      const movementId = nanoid(12);
      await trx.insert(movimientosCuentaCorriente).values({
        id: movementId,
        clienteId,
        empresaId,
        monto: montoNum,
        tipo: 'PAGO',
        saldoResultante: nuevoSaldo,
        observaciones: observaciones || "Pago de deuda manual",
        fecha: new Date(),
      });

      // 4. CONSUMIR DEUDA DE PRODUCTOS (FIFO)
      // Buscamos ítems que deba el cliente, ordenados por los más viejos primero
      const pendingItems = await trx
        .select({
          id: deudasProductos.id,
          cantidad: deudasProductos.cantidadPendiente,
          precioActual: productos.pVenta,
        })
        .from(deudasProductos)
        .innerJoin(productos, eq(deudasProductos.productoId, productos.id))
        .where(and(eq(deudasProductos.clienteId, clienteId), eq(deudasProductos.empresaId, empresaId)))
        .orderBy(deudasProductos.fecha);

      let montoRestante = montoNum;
      for (const item of pendingItems) {
        if (montoRestante <= 0) break;

        const precioActual = Number(item.precioActual ?? 0);
        if (precioActual <= 0) continue; // No podemos valorar ítems sin precio

        const valorTotalItem = item.cantidad * precioActual;

        if (montoRestante >= valorTotalItem) {
          // Cubre todo el ítem
          await trx.delete(deudasProductos).where(eq(deudasProductos.id, item.id));
          montoRestante -= valorTotalItem;
        } else {
          // Cubre parte del ítem
          const cantidadPagada = montoRestante / precioActual;
          const nuevaCantidad = item.cantidad - cantidadPagada;
          await trx.update(deudasProductos)
            .set({ cantidadPendiente: nuevaCantidad })
            .where(eq(deudasProductos.id, item.id));
          montoRestante = 0;
        }
      }

      // 5. Registrar en Caja si es Efectivo
      if (metodoPago === 'efectivo') {
        const [sesionCajaActiva] = await trx
          .select()
          .from(sesionesCaja)
          .where(and(
            eq(sesionesCaja.usuarioAperturaId, user.id),
            eq(sesionesCaja.empresaId, empresaId),
            eq(sesionesCaja.estado, 'abierta')
          ))
          .limit(1);

        if (sesionCajaActiva) {
          await trx.insert(movimientosCaja).values({
            id: nanoid(12),
            sesionCajaId: sesionCajaActiva.id,
            tipo: 'ingreso',
            origen: 'pago_cuenta_corriente',
            monto: montoNum,
            descripcion: `Pago Deuda - Cliente ${clienteDB.nombre}`,
            referenciaId: movementId,
            usuarioId: user.id,
            fecha: new Date(),
            empresaId: empresaId,
          });
        }
      }

      return { nuevoSaldo, movementId };
    });

    return new Response(JSON.stringify({ 
      status: 200, 
      msg: "Pago registrado con éxito",
      data: result 
    }), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ msg: "Error al registrar pago" }), { status: 500 });
  }
}
