import { eq } from "drizzle-orm";
import db from "../db";
import { clientes, detalleVentas, empresas, productos, ventas } from "../db/schema";

export const traerVentasUser = async (empresaId: string) => {
  console.log('empresaId', empresaId);

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
        direccionEmpresa:empresas.direccion,
        documentoEmpresa:empresas.documento,
      })
      .from(ventas)
      .innerJoin(clientes, eq(clientes.id, ventas.clienteId))
      .innerJoin(empresas, eq(ventas.empresaId, empresas.id))
      .where(eq(ventas.empresaId, empresaId));
      console.log('dentro de la funcion ventasData ->', ventasData);
    return ventasData;
  } catch (error) {
    console.log(error);
  }
};
interface VentaDetalle {
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

export const traerVentaId = async (
  ventaId: string
): Promise<VentaDetalle | null> => {
  try {
    const ventaDB = await db
      .select({
        // Datos de la venta
        venta: ventas,
        empresa: empresas,
        // Datos del cliente
        clienteNombre: clientes.nombre,
        clienteDni: clientes.dni,
        clienteDireccion: clientes.direccion,
        // Datos del producto y detalles
        detalleId: detalleVentas.id,
        cantidad: detalleVentas.cantidad,
        precio: detalleVentas.precio,
        impuestoItem: detalleVentas.impuesto,
        descuentoItem: detalleVentas.descuento,
        descipcionProducto: productos.descripcion,
        ivaProducto: productos.iva,
      })
      .from(ventas)
      .innerJoin(detalleVentas, eq(detalleVentas.ventaId, ventas.id))
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .innerJoin(clientes, eq(ventas.clienteId, clientes.id))
      .innerJoin(empresas, eq(ventas.empresaId, empresas.id))
      .where(eq(ventas.id, ventaId));

    if (!ventaDB.length) return null;

    // Estructuramos la respuesta
    const venta: VentaDetalle = {
      id: ventaDB[0].venta.id,
      fecha: ventaDB[0].venta.fecha,
      empresa: {
        razonSocial: ventaDB[0].empresa.razonSocial,
        direccion: ventaDB[0].empresa.direccion,
        documento: ventaDB[0].empresa.documento,
        logo:ventaDB[0].empresa.srcPhoto,
      },
      cliente: {
        nombre: ventaDB[0].clienteNombre,
        dni: ventaDB[0].clienteDni?.toString() || '',
        direccion: ventaDB[0].clienteDireccion || '',
      },
      comprobante: {
        numero: ventaDB[0].venta.nComprobante,
        metodoPago: ventaDB[0].venta.metodoPago,
        nCheque: ventaDB[0].venta.nCheque,
        vencimientoCheque: ventaDB[0].venta.vencimientoCheque,
      },
      items: ventaDB.map((item) => {
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
    console.error("Error al obtener la venta:", error);
    throw new Error("Error al obtener los detalles de la venta");
  }
};
