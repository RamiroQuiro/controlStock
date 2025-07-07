import { eq } from 'drizzle-orm';
import db from '../db'
import {clientes, detallePresupuesto, empresas, presupuesto, productos} from '../db/schema/index'

interface PresupuestoDetalle {
    id: string;
    fecha: number;
    cliente: {
      nombre: string;
      dni: string;
      direccion: string;
    };
    empresa: {
      razonSocial: string;
      direccion: string;
      documento: string;
    };
    comprobante: {
      numero: string;
      metodoPago: string;
      nCheque?: string;
      vencimientoCheque?: string;
    };
    items: Array<{
      id: string;
      producto: string;
      cantidad: number;
      precio: number;
      iva: number;
      descuento: number;
      subtotal: number;
    }>;
    totales: {
      subtotal: number;
      impuesto: number;
      descuento: number;
      total: number;
    };
  }
export const traerPresupuestoId = async (
  presupuestoId: string
): Promise<PresupuestoDetalle[] | null> => {
  try {
    const presupuestosData = await db
    .select({
        // Datos de la venta
        presupuesto: presupuesto,
        empresa: empresas,
        // Datos del cliente
        clienteNombre: clientes.nombre,
        clienteDni: clientes.dni,
        clienteDireccion: clientes.direccion,
        // Datos del producto y detalles
        detalleId: detallePresupuesto.id,
        cantidad:detallePresupuesto.cantidad,
        precio: detallePresupuesto.precioUnitario,
        impuestoItem: detallePresupuesto.impuesto,
        descuentoItem: detallePresupuesto.descuento,
        descipcionProducto: productos.descripcion,
        ivaProducto: productos.iva,
      })
      .from(presupuesto)
      .innerJoin(detallePresupuesto, eq(detallePresupuesto.presupuestoId,presupuesto.id))
      .innerJoin(productos, eq(detallePresupuesto.productoId, productos.id))
      .innerJoin(clientes, eq(presupuesto.clienteId, clientes.id))
      .innerJoin(empresas, eq(presupuesto.empresaId, empresas.id))
      .where(eq(presupuesto.id,presupuestoId ))

    if (!presupuestosData.length) return null;

    // Estructuramos la respuesta
    const presupuestos: PresupuestoDetalle = {
        id: presupuestosData[0].presupuesto.id,
        fecha: presupuestosData[0].presupuesto.fecha,
        empresa: {
          razonSocial: presupuestosData[0].empresa.razonSocial,
          direccion: presupuestosData[0].empresa.direccion,
          documento: presupuestosData[0].empresa.documento,
          logo:presupuestosData[0].empresa.srcPhoto,
        },
        cliente: {
          nombre: presupuestosData[0].clienteNombre,
          dni: presupuestosData[0].clienteDni?.toString() || '',
          direccion: presupuestosData[0].clienteDireccion || '',
        },
        comprobante: {
          numero: presupuestosData[0].presupuesto.numeroFormateado,
        },
        items: presupuestosData.map((item) => {
          const precioSubtotal =
            item.precio - (item.precio * item.ivaProducto) / 100;
  
          return {
            id: item.detalleId,
            descripcion: item.descipcionProducto,
            cantidad: item.cantidad,
            precio: item.precio,
            iva: item.ivaProducto,
            descuento: item.descuentoItem,
            subtotal: precioSubtotal,
          };
        }),
        totales: {
          subtotal:
            presupuestosData[0].presupuesto.total -
            presupuestosData[0].presupuesto.impuesto +
            presupuestosData[0].presupuesto.descuento,
          impuesto: presupuestosData[0].presupuesto.impuesto,
          descuento: presupuestosData[0].presupuesto.descuento,
          total: presupuestosData[0].presupuesto.total,
        },
      };


    return presupuestos;
  } catch (error) {
    console.log(error);
  }
};
