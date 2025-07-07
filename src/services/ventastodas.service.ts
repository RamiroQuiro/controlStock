import { asc, desc, eq } from 'drizzle-orm';
import db from '../db';
import {
  clientes,
  detalleVentas,
  empresas,
  productos,
  ventas,
} from '../db/schema';
import type { ComprobanteDetalle } from './presupuestos.service';

export const traerVentasEmpresa = async (empresaId: string) => {
  try {
    const ventasData = await db
      .select({
        id: ventas.id,
        nComprobante: ventas.nComprobante,
        fecha: ventas.fecha,
        total: ventas.total,
        cliente: clientes.nombre,
        metodoPago: ventas.metodoPago,
        nCheque: ventas.nCheque,
        vencimientoCheque: ventas.vencimientoCheque,
        dniCliente: clientes.dni,
        direccionCliente: clientes.direccion,
        empresaId: ventas.empresaId,
        razonSocial: empresas.razonSocial,
        direccionEmpresa: empresas.direccion,
        documentoEmpresa: empresas.documento,
      })
      .from(ventas)
      .innerJoin(clientes, eq(clientes.id, ventas.clienteId))
      .innerJoin(empresas, eq(ventas.empresaId, empresas.id))
      .where(eq(ventas.empresaId, empresaId))
      .orderBy(desc(ventas.fecha));
    // console.log('ventasData ->', ventasData);

    // console.log('dentro de la funcion ventasData ->', ventasData);
    return ventasData;
  } catch (error) {
    console.log(error);
  }
};

export const traerVentaId = async (
  ventaId: string
): Promise<ComprobanteDetalle | null> => {
  try {
    const ventaDB = await db
      .select({
        // Datos de la venta
        venta: ventas,
        empresa: empresas,
        // Datos del cliente
        cliente: {
          nombre: clientes.nombre,
          dni: clientes.dni,
          direccion: clientes.direccion,
        },
        // Datos del producto y detalles
        detalleId: detalleVentas.id,
        cantidad: detalleVentas.cantidad,
        precioUnitario: detalleVentas.precio,
        impuesto: detalleVentas.impuesto,
        subtotal: detalleVentas.subtotal,
        descuento: detalleVentas.descuento,
        descripcion: productos.descripcion,
        iva: productos.iva,
      })
      .from(ventas)
      .innerJoin(detalleVentas, eq(detalleVentas.ventaId, ventas.id))
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .innerJoin(clientes, eq(ventas.clienteId, clientes.id))
      .innerJoin(empresas, eq(ventas.empresaId, empresas.id))
      .where(eq(ventas.id, ventaId));

    if (!ventaDB.length) return null;

    // Estructuramos la respuesta
    const venta: ComprobanteDetalle = {
      id: ventaDB[0].venta.id,
      fecha: ventaDB[0].venta.fecha,
      dataEmpresa: {
        razonSocial: ventaDB[0].empresa.razonSocial,
        direccion: ventaDB[0].empresa.direccion,
        documento: ventaDB[0].empresa.documento,
        logo: ventaDB[0].empresa.srcPhoto,
        telefono: ventaDB[0].empresa.telefono,
        email: ventaDB[0].empresa.emailEmpresa,
      },
      cliente: {
        nombre: ventaDB[0].cliente.nombre,
        dni: ventaDB[0].cliente.dni?.toString() || '',
        direccion: ventaDB[0].cliente.direccion || '',
      },
      comprobante: {
        numero: ventaDB[0].venta.nComprobante,
        tipo: ventaDB[0].venta.tipo,
        fecha: ventaDB[0].venta.fecha,
        metodoPago: ventaDB[0].venta.metodoPago,
        nCheque: ventaDB[0].venta.nCheque,
        vencimientoCheque: ventaDB[0].venta.vencimientoCheque,
        numeroFormateado: ventaDB[0].venta.numeroFormateado,
        puntoVenta: ventaDB[0].venta.puntoVenta,
        impuesto: ventaDB[0].venta.impuesto,
        descuento: ventaDB[0].venta.descuento,
        total: ventaDB[0].venta.total,
      },
      items: ventaDB.map((item) => {
        const precioSubtotal =
          item.precioUnitario - (item.precioUnitario * item.impuesto) / 100;

        return {
          id: item.detalleId,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          impuesto: item.impuesto,
          iva: item.iva,
          descuento: item.descuento,
          subtotal: precioSubtotal,
        };
      }),
      totales: {
        subtotal:
          ventaDB[0].venta.total -
          ventaDB[0].venta.impuesto +
          ventaDB[0].venta.descuento,
        impuesto: ventaDB[0].venta.impuesto,
        descuento: ventaDB[0].venta.descuento,
        total: ventaDB[0].venta.total,
      },
    };

    return venta;
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    throw new Error('Error al obtener los detalles de la venta');
  }
};
