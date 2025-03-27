import { and, eq } from "drizzle-orm";
import db from "../db";
import {
  comprasProveedores,
  detalleCompras,
  productos,
  proveedores,
} from "../db/schema";

interface CompraDetalle {
  id: string;
  fecha: number;
  proveedor: {
    nombre: string;
    dni?: number;
    direccion?: string;
    email?: string;
    celular?: string;
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

export class ComprasServices {
  traerComprasUser = async (userId: string) => {
    try {
      const comprasData = await db
        .select({
          id: comprasProveedores.id,
          nComprobante: comprasProveedores.nComprobante,
          fecha: comprasProveedores.fecha,
          total: comprasProveedores.total,
          proveedor: proveedores.nombre,
          metodoPago: comprasProveedores.metodoPago,
          dniProveedor: proveedores.dni,
        })
        .from(comprasProveedores)
        .innerJoin(
          proveedores,
          eq(proveedores.id, comprasProveedores.proveedorId)
        )
        .where(eq(comprasProveedores.userId, userId));
      return comprasData;
    } catch (error) {
      console.log(error);
    }
  };

  traerCompraId = async (
    compraId: string,
    userId: string
  ): Promise<CompraDetalle | null> => {
    try {
      const compraDB = await db
        .select({
          // Datos de la venta
          compra: comprasProveedores,
          // Datos del cliente
          proveedor: proveedores.nombre,
          proveedorDni: proveedores.dni,
          emailPRoveedor: proveedores.email,
          celularProveedor: proveedores.celular,
          proveedorDireccion: proveedores.direccion,
          // Datos del producto y detalles
          detalleId: detalleCompras.id,
          cantidad: detalleCompras.cantidad,
          pCompra: detalleCompras.pCompra,
          descuentoItem: detalleCompras.descuento,
          descipcionProducto: productos.descripcion,
          ivaProducto: productos.iva,
        })
        .from(comprasProveedores)
        .innerJoin(
          detalleCompras,
          eq(detalleCompras.compraId, comprasProveedores.id)
        )
        .innerJoin(productos, eq(detalleCompras.productoId, productos.id))
        .innerJoin(
          proveedores,
          eq(comprasProveedores.proveedorId, proveedores.id)
        )
        .where(
          and(
            eq(comprasProveedores.id, compraId),
            eq(comprasProveedores.userId, userId)
          )
        );

      const detallesDb = await db
        .select()
        .from(detalleCompras)
        .where(eq(detalleCompras.compraId, compraId));
      console.log("esta es la compra entonctrada", compraDB);
      if (!compraDB) return null;

      // Estructuramos la respuesta
      const compra: CompraDetalle = {
        id: compraDB[0].compra.id,
        fecha: compraDB[0].compra.fecha,
        proveedor: {
          nombre: compraDB.proveedor,
          dni: compraDB.proveedorDni,
          direccion: compraDB.proveedorDireccion,
          celular: compraDB.celularProveedor,
          email: compraDB.emailPRoveedor,
        },
        comprobante: {
          numero: compraDB[0].compra.nComprobante,
          metodoPago: compraDB[0].compra.metodoPago,
          nCheque: compraDB[0].compra.nCheque,
          vencimientoCheque: compraDB[0].compra.vencimientoCheque,
        },
        items: compraDB?.map((item) => {
          const precioSubtotal =
            item.pCompra - (item.pCompra * item.ivaProducto) / 100;

          return {
            id: item.detalleId,
            descripcion: item.descipcionProducto,
            cantidad: item.cantidad,
            precio: item.pCompra,
            iva: item.ivaProducto,
            descuento: item.descuentoItem,
            subtotal: precioSubtotal,
          };
        }),
        totales: {
          subtotal:
            compraDB[0].compra.total -
            compraDB[0].compra.impuesto +
            compraDB[0].compra.descuento,
          descuento: compraDB[0].compra.descuento,
          total: compraDB[0].compra.total,
        },
      };

      return compra;
    } catch (error) {
      console.error("Error al obtener la venta:", error);
      throw new Error("Error al obtener los detalles de la venta");
    }
  };
}
