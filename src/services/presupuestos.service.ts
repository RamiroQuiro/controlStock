import { eq } from 'drizzle-orm';
import db from '../db';
import {
  clientes,
  detallePresupuesto,
  empresas,
  presupuesto,
  productos,
} from '../db/schema/index';
import type { ComprobanteDetalle } from '../types';

export const traerPresupuestoId = async (
  presupuestoId: string
): Promise<ComprobanteDetalle | null> => {
  try {
    const presupuestosData = await db
      .select({
        // Datos de la venta
        presupuesto: presupuesto,
        empresa: empresas,
        // Datos del cliente
        cliente: {
          nombre: clientes.nombre,
          documento: clientes.dni,
          direccion: clientes.direccion,
        },
        // Datos del producto y detalles
        detalleId: detallePresupuesto.id,
        cantidad: detallePresupuesto.cantidad,
        precioUnitario: detallePresupuesto.precioUnitario,
        impuesto: detallePresupuesto.impuesto,
        subtotal: detallePresupuesto.subtotal,
        descuento: detallePresupuesto.descuento,
        descripcion: productos.descripcion,
        iva: productos.iva,
        expira_at: presupuesto.expira_at,
        fecha: presupuesto.fecha,
      })
      .from(presupuesto)
      .innerJoin(
        detallePresupuesto,
        eq(detallePresupuesto.presupuestoId, presupuesto.id)
      )
      .innerJoin(productos, eq(detallePresupuesto.productoId, productos.id))
      .innerJoin(clientes, eq(presupuesto.clienteId, clientes.id))
      .innerJoin(empresas, eq(presupuesto.empresaId, empresas.id))
      .where(eq(presupuesto.id, presupuestoId));

    if (!presupuestosData.length) return null;
    // console.log('presupuestosData ->', presupuestosData);
    // Estructuramos la respuesta
    const presupuestos: ComprobanteDetalle = {
      id: presupuestosData[0].presupuesto.id,
      fecha: presupuestosData[0].presupuesto.fecha,
      tipo: 'PRESUPUESTO',
      dataEmpresa: {
        razonSocial: presupuestosData[0].empresa.razonSocial,
        direccion: presupuestosData[0].empresa.direccion || '',
        documento: presupuestosData[0].empresa.documento || '',
        telefono: presupuestosData[0].empresa.telefono || '',
        email: presupuestosData[0].empresa.emailEmpresa || '',
        logo: presupuestosData[0].empresa.srcPhoto,
      },
      cliente: presupuestosData[0].cliente,
      comprobante: {
        numero: presupuestosData[0].presupuesto.numeroFormateado,
        numeroFormateado: presupuestosData[0].presupuesto.numeroFormateado,
        fecha: presupuestosData[0].presupuesto.fecha,
        tipo: 'PRESUPUESTO',
        subtotal:
          presupuestosData[0].presupuesto.total -
          presupuestosData[0].presupuesto.impuesto +
          presupuestosData[0].presupuesto.descuento,
        impuestos: presupuestosData[0].presupuesto.impuesto,
        descuentos: presupuestosData[0].presupuesto.descuento,
        total: presupuestosData[0].presupuesto.total,
        expira_at: presupuestosData[0].expira_at,
        fecha: presupuestosData[0].fecha,
      },
      totales: {
        subtotal:
          presupuestosData[0].presupuesto.total -
          presupuestosData[0].presupuesto.impuesto +
          presupuestosData[0].presupuesto.descuento,
        impuesto: presupuestosData[0].presupuesto.impuesto,
        descuento: presupuestosData[0].presupuesto.descuento,
        total: presupuestosData[0].presupuesto.total,
      },
      items: presupuestosData.map((item) => {
        const precioSubtotal =
          item.precioUnitario - (item.precioUnitario * item.iva) / 100;

        return {
          id: item.detalleId,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          impuesto: item.impuesto || 0,
          iva: item.iva || 0,
          descuento: item.descuento || 0,
          subtotal: item.subtotal,
        };
      }),
    };

    return presupuestos;
  } catch (error) {
    console.log(error);
  }
};
