import { nanoid } from "nanoid";
import { sql, eq, and } from "drizzle-orm";
import type { APIContext } from "astro";
import {
  comprasProveedores,
  detalleCompras,
  movimientosStock,
  productos,
  stockActual,
  proveedores,
} from "../../../db/schema";
import db from "../../../db";
import { createResponse, User } from "../../../types";
import { getFechaUnix } from "../../../utils/timeUtils";

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const { productos: productosComprados, data } = await request.json();

    console.log("prodcutos ->", productosComprados);
    console.log("data ->", data);
    // 1. Validación de seguridad y datos de entrada
    const { user } = locals as { user: User };
    if (!user) {
      return createResponse(401, "No autorizado");
    }

    if (
      !productosComprados ||
      !Array.isArray(productosComprados) ||
      productosComprados.length === 0 ||
      !data.proveedorId
    ) {
      return createResponse(400, "Datos inválidos o incompletos");
    }

    if (data.total <= 0) {
      return createResponse(402, "El monto total debe ser mayor a 0");
    }
    // 2. Lógica de la transacción
    const compraDB = await db.transaction(async (trx) => {
      const compraId = nanoid();
      const fechaActual = new Date();

      // Manejo seguro de la fecha de vencimiento opcional
      const vencimientoCheque = data.vencimientoCheque
        ? new Date(data.vencimientoCheque)
        : null;

      // 🐛 DEBUG: Verificar datos de la compra
      console.log("🔍 DEBUG Compra:", {
        total: data.total,
        descuento: data.descuento,
        esFinito: {
          total: Number(data.total),
          descuento: Number(data.descuento),
        },
      });

      // 🔍 VALIDACIÓN: Verificar que las foreign keys existan
      console.log("🔍 DEBUG Foreign Keys:", {
        userId: user.id,
        empresaId: user.empresaId,
        proveedorId: data.proveedorId,
      });

      // Validar que el proveedor existe
      if (!data.proveedorId) {
        throw new Error("proveedorId es requerido");
      }

      const [proveedorExiste] = await trx
        .select({ id: proveedores.id })
        .from(proveedores)
        .where(eq(proveedores.id, data.proveedorId))
        .limit(1);

      if (!proveedorExiste) {
        throw new Error(`El proveedor con ID ${data.proveedorId} no existe`);
      }
      console.log("empezando a registrar compra");
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
          vencimientoCheque: vencimientoCheque,
          total: data.total,
          descuento: data.descuento,
          fecha: fechaActual,
        })
        .returning();
      console.log("compraRegistrada", compraRegistrada);
      console.log("productosComprados", productosComprados);
      for (const prod of productosComprados) {
        const [stockAnterior] = await trx
          .select({
            cantidad: stockActual.cantidad,
            precioPromedio: stockActual.precioPromedio,
          })
          .from(stockActual)
          .where(
            and(
              eq(stockActual.productoId, prod.id),
              eq(stockActual.empresaId, user.empresaId)
            )
          )
          .limit(1);
        console.log("stockAnterior", stockAnterior);
        const cantidadAnterior = stockAnterior?.cantidad || 0;
        const precioAnterior = stockAnterior?.precioPromedio || prod.pCompra;
        console.log("cantidadAnterior", cantidadAnterior);
        console.log("precioAnterior", precioAnterior);
        const nuevoPrecioPromedio =
          cantidadAnterior > 0
            ? (cantidadAnterior * precioAnterior +
                prod.cantidad * prod.pCompra) /
              (cantidadAnterior + prod.cantidad)
            : prod.pCompra;
        console.log("nuevoPrecioPromedio", nuevoPrecioPromedio);
        // 🐛 DEBUG: Verificar valores antes de actualizar
        console.log("🔍 DEBUG Producto:", {
          productoId: prod.id,
          cantidadAnterior,
          precioAnterior,
          cantidadNueva: prod.cantidad,
          precioNuevo: prod.pCompra,
          nuevoPrecioPromedio,
          esFinito: Number.isFinite(nuevoPrecioPromedio),
        });
        console.log("por ir a actualizar el stock actual");
        // Actualizar stockActual con cantidad y precio promedio
        await trx
          .update(stockActual)
          .set({
            cantidad: sql`${stockActual.cantidad} + ${prod.cantidad}`,
            precioPromedio: nuevoPrecioPromedio,
            userUltimaReposicion: user.id,
            ultimaReposicion: fechaActual,
            updatedAt: fechaActual,
          })
          .where(
            and(
              eq(stockActual.productoId, prod.id),
              eq(stockActual.empresaId, user.empresaId)
            )
          );
        console.log("por ir a registrar el movimiento en stock");
        // Registrar el movimiento en stock
        await trx.insert(movimientosStock).values({
          id: nanoid(),
          productoId: prod.id,
          cantidad: prod.cantidad,
          tipo: "ingreso",
          fecha: fechaActual,
          userId: user.id,
          empresaId: user.empresaId,
          proveedorId: data.proveedorId,
          motivo: "compra",
          observacion: data.observacion || null,
        });
        console.log("por ir a insertar en detalleCompras");
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

    return createResponse(200, "Compra registrada exitosamente", compraDB);
  } catch (error) {
    console.error("Error en la compra:", error);
    return createResponse(500, "Error al registrar la compra", error.message);
  }
}
