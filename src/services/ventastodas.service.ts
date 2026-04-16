import { asc, desc, eq } from "drizzle-orm";
import db from "../db";
import {
  clientes,
  detalleVentas,
  empresas,
  productos,
  ventas,
  presupuesto,
  detallePresupuesto,
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
    // 1. Intentar buscar en la tabla de Ventas
    let comprobanteDB = await db
      .select({
        comprobante: ventas,
        empresa: empresas,
        cliente: {
          nombre: clientes.nombre,
          dni: clientes.dni,
          direccion: clientes.direccion,
        },
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

    // 2. Si no se encuentra en ventas, intentar buscar en Presupuestos
    if (!comprobanteDB.length) {
      comprobanteDB = await db
        .select({
          comprobante: presupuesto,
          empresa: empresas,
          cliente: {
            nombre: clientes.nombre,
            dni: clientes.dni,
            direccion: clientes.direccion,
          },
          detalleId: detallePresupuesto.id,
          cantidad: detallePresupuesto.cantidad,
          precioUnitario: detallePresupuesto.precioUnitario,
          impuesto: detallePresupuesto.impuesto || 0,
          subtotal: detallePresupuesto.subtotal || 0,
          descuento: detallePresupuesto.descuento || 0,
          descripcion: productos.descripcion,
          iva: productos.iva || 0,
        })
        .from(presupuesto)
        .innerJoin(detallePresupuesto, eq(detallePresupuesto.presupuestoId, presupuesto.id))
        .innerJoin(productos, eq(detallePresupuesto.productoId, productos.id))
        .innerJoin(clientes, eq(presupuesto.clienteId, clientes.id))
        .innerJoin(empresas, eq(presupuesto.empresaId, empresas.id))
        .where(eq(presupuesto.id, ventaId));
    }

    if (!comprobanteDB.length) return null;

    const primerRegistro = comprobanteDB[0];

    // Estructuramos la respuesta unficada
    const comprobante: ComprobanteDetalle = {
      id: primerRegistro.comprobante.id,
      codigo: (primerRegistro.comprobante as any).codigo || "",
      numeroFormateado: primerRegistro.comprobante.numeroFormateado || "",
      puntoVenta: primerRegistro.comprobante.puntoVenta || "",
      empresaId: primerRegistro.comprobante.empresaId || "",
      fecha: primerRegistro.comprobante.fecha,
      tipo: (primerRegistro.comprobante as any).tipo || (primerRegistro.comprobante as any).tipoComprobante || "",
      subtotal: primerRegistro.comprobante.total - primerRegistro.comprobante.impuesto - primerRegistro.comprobante.descuento,
      impuesto: primerRegistro.comprobante.impuesto || 0,
      descuento: primerRegistro.comprobante.descuento || 0,
      total: primerRegistro.comprobante.total || 0,
      expira_at: (primerRegistro.comprobante as any).expira_at,
      dataEmpresa: {
        razonSocial: primerRegistro.empresa.razonSocial,
        direccion: primerRegistro.empresa.direccion || "",
        documento: primerRegistro.empresa.documento || 0,
        telefono: primerRegistro.empresa.telefono || "",
        email: primerRegistro.empresa.email || "",
        logo: primerRegistro.empresa.srcPhoto || "",
      },
      cliente: {
        nombre: primerRegistro.cliente.nombre,
        dni: primerRegistro.cliente.dni?.toString() || "",
        direccion: primerRegistro.cliente.direccion || "",
      },
      comprobante: {
        numero: (primerRegistro.comprobante as any).nComprobante || (primerRegistro.comprobante as any).numero || 0,
        numeroFormateado: primerRegistro.comprobante.numeroFormateado || "",
        tipo: (primerRegistro.comprobante as any).tipo || (primerRegistro.comprobante as any).tipoComprobante || "",
        fecha: primerRegistro.comprobante.fecha,
        metodoPago: (primerRegistro.comprobante as any).metodoPago || "EFECTIVO",
        nCheque: (primerRegistro.comprobante as any).nCheque || "",
        vencimientoCheque: (primerRegistro.comprobante as any).vencimientoCheque || "",
        subtotal: primerRegistro.comprobante.total - primerRegistro.comprobante.impuesto - primerRegistro.comprobante.descuento,
        puntoVenta: primerRegistro.comprobante.puntoVenta,
        impuesto: primerRegistro.comprobante.impuesto || 0,
        descuento: primerRegistro.comprobante.descuento || 0,
        total: primerRegistro.comprobante.total || 0,
        expira_at: (primerRegistro.comprobante as any).expira_at,
      },
      items: comprobanteDB.map((item) => ({
        id: item.detalleId,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        impuesto: item.impuesto || 0,
        iva: item.iva || 0,
        descuento: item.descuento || 0,
        subtotal: item.subtotal,
      })),
      totales: {
        subtotal: primerRegistro.comprobante.total - primerRegistro.comprobante.impuesto + primerRegistro.comprobante.descuento,
        impuesto: primerRegistro.comprobante.impuesto || 0,
        descuento: primerRegistro.comprobante.descuento || 0,
        total: primerRegistro.comprobante.total || 0,
      },
    };

    return comprobante as any;
  } catch (error) {
    console.error("Error al obtener el comprobante:", error);
    throw new Error("Error al obtener los detalles del comprobante");
  }
};
