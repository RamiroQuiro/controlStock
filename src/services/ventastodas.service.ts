import { asc, desc, eq } from "drizzle-orm";
import db from "../db";
import {
  clientes,
  detalleVentas,
  empresas,
  productos,
  ventas,
} from "../db/schema";
import type { ComprobanteDetalle } from "../types";

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

export const traerVentaId = async (ventaId: string) => {
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
        impuesto: detalleVentas.impuesto || 0,
        subtotal: detalleVentas.subtotal || 0,
        descuento: detalleVentas.descuento || 0,
        descripcion: productos.descripcion,
        iva: productos.iva || 0,
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
        direccion: ventaDB[0].empresa.direccion || "",
        documento: ventaDB[0].empresa.documento || 0 ,
        telefono: ventaDB[0].empresa.telefono || "",
        email: ventaDB[0].empresa.email || "",
        logo: ventaDB[0].empresa.srcPhoto || "",
      },
      cliente: {
        nombre: ventaDB[0].cliente.nombre,
        dni: ventaDB[0].cliente.dni?.toString() || "",
        direccion: ventaDB[0].cliente.direccion || "",
      },
      comprobante: {
        numero: ventaDB[0].venta.nComprobante || 0 ,
        tipo: ventaDB[0].venta.tipo,
        fecha: ventaDB[0].venta.fecha,
        metodoPago: ventaDB[0].venta.metodoPago || "EFECTIVO",
        nCheque: ventaDB[0].venta.nCheque || "",
        vencimientoCheque: ventaDB[0].venta.vencimientoCheque || "",
        subtotal:ventaDB[0].venta.total - ventaDB[0].venta.impuesto - ventaDB[0].venta.descuento,
        numeroFormateado: ventaDB[0].venta.numeroFormateado || "",
        puntoVenta: ventaDB[0].venta.puntoVenta,
        impuesto: ventaDB[0].venta.impuesto || 0,
        descuento: ventaDB[0].venta.descuento || 0,
        total: ventaDB[0].venta.total || 0,
      },
      items: ventaDB.map((item) => {
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
      totales: {
        subtotal:
          ventaDB[0].venta.total || 0 -
          ventaDB[0].venta.impuesto || 0 +
          ventaDB[0].venta.descuento || 0,
        impuesto: ventaDB[0].venta.impuesto || 0,
        descuento: ventaDB[0].venta.descuento || 0,
        total: ventaDB[0].venta.total || 0,
      },
    };
console.log('venta ->', venta)
    return venta;
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    throw new Error("Error al obtener los detalles de la venta");
  }
};
