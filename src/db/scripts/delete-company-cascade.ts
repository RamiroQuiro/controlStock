import { eq } from "drizzle-orm";
import {
  empresas,
  users,
  productos,
  clientes,
  proveedores,
  categorias,
  ventas,
  detalleVentas,
  comprasProveedores,
  detalleCompras,
  stockActual,
  movimientosStock,
  depositos,
  ubicaciones,
  puntosDeVenta,
  suscripciones,
  presupuesto,
  detallePresupuesto,
  traslados,
  detalleTraslados,
  productoCategorias,
  empresaConfigTienda,
  comprobanteNumeracion,
  comprobantes,
  usuariosDepositos,
  localizaciones,
  plantillas,
  productosFts,
} from "../schema";

export const deleteCompanyCascade = async (empresaId: string, db: any) => {
  console.log(`Iniciando eliminación en cascada para la empresa: ${empresaId}`);

  try {
    await db.transaction(async (trx: any) => {
      // 1. Eliminar detalles transaccionales (Hijos de transacciones)
      console.log("Eliminando detalles de ventas...");
      const ventasEmpresa = await trx
        .select({ id: ventas.id })
        .from(ventas)
        .where(eq(ventas.empresaId, empresaId));

      for (const venta of ventasEmpresa) {
        await trx
          .delete(detalleVentas)
          .where(eq(detalleVentas.ventaId, venta.id));
      }

      console.log("Eliminando detalles de compras...");
      const comprasEmpresa = await trx
        .select({ id: comprasProveedores.id })
        .from(comprasProveedores)
        .where(eq(comprasProveedores.empresaId, empresaId));

      for (const compra of comprasEmpresa) {
        await trx
          .delete(detalleCompras)
          .where(eq(detalleCompras.compraId, compra.id));
      }

      console.log("Eliminando detalles de presupuestos...");
      const presupuestosEmpresa = await trx
        .select({ id: presupuesto.id })
        .from(presupuesto)
        .where(eq(presupuesto.empresaId, empresaId));

      for (const pres of presupuestosEmpresa) {
        await trx
          .delete(detallePresupuesto)
          .where(eq(detallePresupuesto.presupuestoId, pres.id));
      }

      console.log("Eliminando detalles de traslados...");
      const trasladosEmpresa = await trx
        .select({ id: traslados.id })
        .from(traslados)
        .where(eq(traslados.empresaId, empresaId));

      for (const traslado of trasladosEmpresa) {
        await trx
          .delete(detalleTraslados)
          .where(eq(detalleTraslados.trasladoId, traslado.id));
      }

      // 2. Eliminar transacciones principales y movimientos
      console.log("Eliminando movimientos de stock...");
      await trx
        .delete(movimientosStock)
        .where(eq(movimientosStock.empresaId, empresaId));

      console.log("Eliminando ventas...");
      await trx.delete(ventas).where(eq(ventas.empresaId, empresaId));

      console.log("Eliminando compras...");
      await trx
        .delete(comprasProveedores)
        .where(eq(comprasProveedores.empresaId, empresaId));

      console.log("Eliminando presupuestos...");
      await trx.delete(presupuesto).where(eq(presupuesto.empresaId, empresaId));

      console.log("Eliminando traslados...");
      await trx.delete(traslados).where(eq(traslados.empresaId, empresaId));

      // 3. Eliminar Stock e Inventario
      console.log("Eliminando stock actual...");
      await trx.delete(stockActual).where(eq(stockActual.empresaId, empresaId));

      // 4. Eliminar Productos y relaciones
      console.log("Eliminando relaciones producto-categoría...");
      const productosEmpresa = await trx
        .select({ id: productos.id })
        .from(productos)
        .where(eq(productos.empresaId, empresaId));

      for (const prod of productosEmpresa) {
        await trx
          .delete(productoCategorias)
          .where(eq(productoCategorias.productoId, prod.id));
      }

      console.log("Eliminando productos...");
      await trx.delete(productos).where(eq(productos.empresaId, empresaId));

      // 5. Eliminar Datos Maestros
      console.log("Eliminando clientes...");
      await trx.delete(clientes).where(eq(clientes.empresaId, empresaId));

      console.log("Eliminando proveedores...");
      await trx.delete(proveedores).where(eq(proveedores.empresaId, empresaId));

      console.log("Eliminando categorías...");
      await trx.delete(categorias).where(eq(categorias.empresaId, empresaId));

      console.log("Eliminando configuraciones de tienda...");
      await trx
        .delete(empresaConfigTienda)
        .where(eq(empresaConfigTienda.empresaId, empresaId));

      console.log("Eliminando numeración de comprobantes...");
      await trx
        .delete(comprobanteNumeracion)
        .where(eq(comprobanteNumeracion.empresaId, empresaId));

      console.log("Eliminando comprobantes...");
      await trx
        .delete(comprobantes)
        .where(eq(comprobantes.empresaId, empresaId));

      console.log("Eliminando puntos de venta...");
      await trx
        .delete(puntosDeVenta)
        .where(eq(puntosDeVenta.empresaId, empresaId));

      // 6. Eliminar Estructura Física (Depositos, Ubicaciones)
      console.log("Eliminando usuarios-depositos...");
      const depositosEmpresa = await trx
        .select({ id: depositos.id })
        .from(depositos)
        .where(eq(depositos.empresaId, empresaId));
      for (const dep of depositosEmpresa) {
        await trx
          .delete(usuariosDepositos)
          .where(eq(usuariosDepositos.depositoId, dep.id));
      }

      console.log("Eliminando ubicaciones...");
      await trx.delete(ubicaciones).where(eq(ubicaciones.empresaId, empresaId));

      console.log("Eliminando depósitos...");
      await trx.delete(depositos).where(eq(depositos.empresaId, empresaId));

      console.log("Eliminando localizaciones...");
      await trx
        .delete(localizaciones)
        .where(eq(localizaciones.empresaId, empresaId));

      // 7. Eliminar Suscripciones y Usuarios
      console.log("Eliminando suscripciones...");
      await trx
        .delete(suscripciones)
        .where(eq(suscripciones.empresaId, empresaId));

      console.log("Eliminando usuarios...");
      await trx.delete(users).where(eq(users.empresaId, empresaId));

      // 8. Finalmente, eliminar la empresa
      console.log("Eliminando empresa...");
      await trx.delete(empresas).where(eq(empresas.id, empresaId));
    });

    console.log("✅ Eliminación en cascada completada con éxito.");
    return { success: true, msg: "Empresa y todos sus datos eliminados." };
  } catch (error) {
    console.error("❌ Error en eliminación en cascada:", error);
    return { success: false, msg: "Error al eliminar empresa.", error };
  }
};
