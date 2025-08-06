import { nanoid } from 'nanoid';
import { sql, eq, and } from 'drizzle-orm';
import type { APIContext } from 'astro';
import {
  comprasProveedores,
  detalleCompras,
  movimientosStock,
  productos,
  stockActual,
} from '../../../db/schema';
import db from '../../../db';
import { createResponse, User } from '../../../types';

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const { productos: productosComprados, data } = await request.json();

    // 1. Validación de seguridad y datos de entrada
    const user = locals.user as User;
    if (!user) {
      return createResponse(401, 'No autorizado');
    }

    if (!productosComprados || !Array.isArray(productosComprados) || productosComprados.length === 0 || !data.proveedorId) {
      return createResponse(400, 'Datos inválidos o incompletos');
    }

    if (data.total <= 0) {
      return createResponse(402, 'El monto total debe ser mayor a 0');
    }
console.log('data que llega al enpoint',data,'productos comprados',productosComprados)
    // 2. Lógica de la transacción
    const compraDB = await db.transaction(async (trx) => {
      const compraId = nanoid();
      const fechaActual = new Date(); // Usar new Date() directamente es más limpio

      // Manejo seguro de la fecha de vencimiento opcional
      const vencimientoCheque = data.vencimientoCheque ? new Date(data.vencimientoCheque) : null;

      const [compraRegistrada] = await trx
        .insert(comprasProveedores)
        .values({
          id: compraId,
          userId: user.id,
          empresaId: user.empresaId,
          proveedorId: data.proveedorId,
          metodoPago: data.metodoPago,
          nComprobante: data.nComprobante,
          nCheque: data.nCheque,
          vencimientoCheque: vencimientoCheque, // Usar la fecha procesada
          total: data.total,
          impuesto: data.impuesto,
          descuento: data.descuento,
          fecha: fechaActual,
        })
        .returning();

      for (const prod of productosComprados) {
        // Actualizar stock de productos
        await trx
          .update(productos)
          .set({
            stock: sql`${productos.stock} + ${prod.cantidad}`,
            pCompra: prod.pCompra, // Actualizar también el costo de compra
          })
          .where(eq(productos.id, prod.id));

        // Actualizar stockActual (Corregido el nombre de la tabla)
        await trx
          .update(stockActual)
          .set({
            cantidad: sql`${stockActual.cantidad} + ${prod.cantidad}`,
            updatedAt: fechaActual,
          })
          .where(and(eq(stockActual.productoId, prod.id), eq(stockActual.empresaId, user.empresaId)));

        // Registrar el movimiento en stock
        await trx.insert(movimientosStock).values({
          id: nanoid(),
          productoId: prod.id,
          cantidad: prod.cantidad,
          tipo: 'ingreso',
          fecha: fechaActual,
          userId: user.id,
          empresaId: user.empresaId,
          proveedorId: data.proveedorId,
          motivo: 'compra',
          observacion: data.observacion || null,
        });

        // Insertar en detalleCompras
        await trx.insert(detalleCompras).values({
            id: nanoid(),
            compraId,
            productoId: prod.id,
            cantidad: prod.cantidad,
            pCompra: prod.pCompra,
            precioReal: prod.precioReal || prod.pCompra,
            descuento: prod.descuento || 0,
            subtotal: prod.cantidad * prod.pCompra,
          });
      }

      return compraRegistrada;
    });

    return createResponse(200, 'Compra registrada exitosamente', compraDB);

  } catch (error) {
    console.error('Error en la compra:', error);
    return createResponse(500, 'Error al registrar la compra', error.message);
  }
}
