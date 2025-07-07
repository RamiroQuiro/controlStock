import { eq } from "drizzle-orm";
import db from "../db";
import {
  clientes,
  detallePresupuesto,
  empresas,
  presupuesto,
  productos,
} from "../db/schema/index";

export interface PresupuestoDetalle {
  id: string;
  codigo: string;
  numeroFormateado: string;
  puntoVenta: string;
  empresaId: string;
  fecha: string;
  tipo: string;
  subtotal: number;
  impuesto: string;
  descuento: string;
  total: number;
  expira_at: string;
  cliente: {
    nombre: string;
    dni: string;
    direccion: string;
  };
  dataEmpresa: {
    razonSocial: string;
    direccion: string;
    documento: number;
    telefono: string;
    email: string;
    web: string;
    logo: string;
  };
  comprobante: {
    numero: string;
    presupuesto: string;
    metodoPago: string;
    nCheque?: string;
    tipo: string;
    vencimientoCheque?: string;
  };
  items: Array<{
    id: string;
    producto: string;
    cantidad: number;
    precio: number;
    impuesto: number;
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
        cliente: {
          nombre: clientes.nombre,
          documento: clientes.dni,
          direccion: clientes.direccion,
        },
        // Datos del producto y detalles
        detalleId: detallePresupuesto.id,
        cantidad: detallePresupuesto.cantidad,
        precio: detallePresupuesto.precioUnitario,
        impuestoItem: detallePresupuesto.impuesto,
        descuentoItem: detallePresupuesto.descuento,
        descipcionProducto: productos.descripcion,
        ivaProducto: productos.iva,
        expira_at:presupuesto.expira_at
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

    // Estructuramos la respuesta
    const presupuestos: PresupuestoDetalle = {
      id: presupuestosData[0].presupuesto.id,
      fecha: presupuestosData[0].presupuesto.fecha,
      tipo: "PRESUPUESTO",
      empresa: {
        razonSocial: presupuestosData[0].empresa.razonSocial,
        direccion: presupuestosData[0].empresa.direccion || "",
        documento: presupuestosData[0].empresa.documento || 0,
        logo: presupuestosData[0].empresa.srcPhoto,
      },
      cliente: presupuestosData[0].cliente,
      comprobante: {
        numero: presupuestosData[0].presupuesto.numeroFormateado,
        tipo: "PRESUPUESTO",
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

      subtotal:
        presupuestosData[0].presupuesto.total -
        presupuestosData[0].presupuesto.impuesto +
        presupuestosData[0].presupuesto.descuento,
      impuestos: presupuestosData[0].presupuesto.impuesto,
      descuentos: presupuestosData[0].presupuesto.descuento,
      total: presupuestosData[0].presupuesto.total,
      expira_at: presupuestosData[0].expira_at,
    };

    return presupuestos;
  } catch (error) {
    console.log(error);
  }
};
