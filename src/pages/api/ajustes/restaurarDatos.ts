import type { APIRoute } from 'astro';
import db from '../../../db';
import {
  productos,
  clientes,
  proveedores,
  ventas,
  comprasProveedores,
  stockActual,
  users,
  roles,
  detalleVentas,
  detalleCompras,
  detallePresupuesto,
  movimientosStock,
  presupuesto,
  categorias,
  depositos,
  ubicaciones,
  productoCategorias,
  comprobantes,
  comprobanteNumeracion,
  puntosDeVenta,
  empresaConfigTienda,
  usuariosDepositos,
  plantillas,
  localizaciones,
  empresas
} from '../../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import eventEmitter from '../../../lib/event-emitter';

// Helper function to convert date strings to Date objects
const parseDates = (data: any[], dateFields: string[]) => {
  if (!data) return [];
  return data.map(item => {
    const newItem = { ...item };
    dateFields.forEach(field => {
      if (newItem[field]) {
        newItem[field] = new Date(newItem[field]);
      }
    });
    return newItem;
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;

  if (!user || !user.empresaId) {
    return new Response(JSON.stringify({ error: 'Usuario no autenticado o sin empresa asignada' }), {
      status: 401,
    });
  }

  const { empresaId } = user;

  try {
    const formData = await request.formData();
    const file = formData.get('backup') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No se proporcionó ningún archivo' }), {
        status: 400,
      });
    }

    const text = await file.text();
    const backupData = JSON.parse(text);

    eventEmitter.emit('restore-progress', '📦 Restaurando backup…');

    await db.transaction(async (tx) => {
      eventEmitter.emit('restore-progress', '🧹 Borrando datos existentes…');

      // 1. Delete existing data
      const ventasIds = await tx
        .select({ id: ventas.id })
        .from(ventas)
        .where(eq(ventas.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (ventasIds.length > 0) {
        await tx.delete(detalleVentas).where(inArray(detalleVentas.ventaId, ventasIds));
        eventEmitter.emit('restore-progress', `🗑️ Detalles de ventas eliminados: ${ventasIds.length}`);
      }

      const comprasIds = await tx
        .select({ id: comprasProveedores.id })
        .from(comprasProveedores)
        .where(eq(comprasProveedores.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (comprasIds.length > 0) {
        await tx.delete(detalleCompras).where(inArray(detalleCompras.compraId, comprasIds));
        eventEmitter.emit('restore-progress', `🗑️ Detalles de compras eliminados: ${comprasIds.length}`);
      }

      const presupuestoIds = await tx
        .select({ id: presupuesto.id })
        .from(presupuesto)
        .where(eq(presupuesto.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (presupuestoIds.length > 0) {
        await tx.delete(detallePresupuesto).where(inArray(detallePresupuesto.presupuestoId, presupuestoIds));
        eventEmitter.emit('restore-progress', `🗑️ Detalles de presupuestos eliminados: ${presupuestoIds.length}`);
      }

      const productoIds = await tx
        .select({ id: productos.id })
        .from(productos)
        .where(eq(productos.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (productoIds.length > 0) {
        await tx.delete(productoCategorias).where(inArray(productoCategorias.productoId, productoIds));
        eventEmitter.emit('restore-progress', `🗑️ Categorías de productos eliminadas: ${productoIds.length}`);
      }

      const userIds = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (userIds.length > 0) {
        await tx.delete(usuariosDepositos).where(inArray(usuariosDepositos.usuarioId, userIds));
        eventEmitter.emit('restore-progress', `🗑️ Depósitos de usuarios eliminados: ${userIds.length}`);
      }

      await tx.delete(movimientosStock).where(eq(movimientosStock.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Movimientos de stock eliminados');
      await tx.delete(stockActual).where(eq(stockActual.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Stock actual eliminado');
      await tx.delete(ventas).where(eq(ventas.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Ventas eliminadas');
      await tx.delete(comprasProveedores).where(eq(comprasProveedores.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Compras eliminadas');
      await tx.delete(presupuesto).where(eq(presupuesto.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Presupuestos eliminados');
      await tx.delete(productos).where(eq(productos.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Productos eliminados');
      await tx.delete(clientes).where(eq(clientes.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Clientes eliminados');
      await tx.delete(proveedores).where(eq(proveedores.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Proveedores eliminados');
      await tx.delete(comprobanteNumeracion).where(eq(comprobanteNumeracion.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Numeración de comprobantes eliminada');
      await tx.delete(comprobantes).where(eq(comprobantes.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Comprobantes eliminados');
      await tx.delete(puntosDeVenta).where(eq(puntosDeVenta.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Puntos de venta eliminados');
      await tx.delete(empresaConfigTienda).where(eq(empresaConfigTienda.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Configuración de tienda eliminada');
      await tx.delete(plantillas).where(eq(plantillas.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Plantillas eliminadas');
      await tx.delete(localizaciones).where(eq(localizaciones.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Localizaciones eliminadas');
      await tx.delete(ubicaciones).where(eq(ubicaciones.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Ubicaciones eliminadas');
      await tx.delete(depositos).where(eq(depositos.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Depósitos eliminados');
      await tx.delete(categorias).where(eq(categorias.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Categorías eliminadas');
      await tx.delete(roles).where(eq(roles.empresaId, empresaId));
      eventEmitter.emit('restore-progress', '🗑️ Roles eliminados');

      eventEmitter.emit('restore-progress', '📥 Insertando datos del backup…');
      // 2. Insert restored data
      const backup = backupData as any;

      const empresasData = parseDates(backup.empresas, ['created_at', 'updated_at']);
      const rolesData = parseDates(backup.roles, ['fechaCreacion']);
      const usersData = parseDates(backup.users, ['fechaAlta', 'updated_at']);
      const clientesData = parseDates(backup.clientes, ['fechaAlta', 'ultimaCompra']);
      const proveedoresData = parseDates(backup.proveedores, ['created_at']);
      const categoriasData = parseDates(backup.categorias, ['created_at']);
      const depositosData = parseDates(backup.depositos, ['fechaCreacion']);
      const ubicacionesData = parseDates(backup.ubicaciones, ['fechaCreacion']);
      const localizacionesData = parseDates(backup.localizaciones, ['fechaCreacion']);
      const productosData = parseDates(backup.productos, ['fechaInicioOferta', 'fechaFinOferta', 'ultimaActualizacion', 'created_at']);
      const stockData = parseDates(backup.stock, ['createdAt', 'updatedAt']);
      const movimientosStockData = parseDates(backup.movimientosStock, ['fecha']);
      const ventasData = parseDates(backup.ventas, ['fecha', 'vencimientoCheque']);
      const comprasData = parseDates(backup.compras, ['fecha', 'vencimientoCheque']);
      const presupuestosData = parseDates(backup.presupuestos, ['fecha', 'expira_at']);
      const comprobantesData = parseDates(backup.comprobantes, ['fechaEmision', 'fecha', 'caeVencimiento', 'create_at', 'update_at']);
      const comprobanteNumeracionData = parseDates(backup.comprobanteNumeracion, ['create_at', 'update_at', 'updatedAt']);
      const plantillasData = parseDates(backup.plantillas, ['fechaCreacion']);
      const productoCategoriasData = parseDates(backup.productoCategorias, ['created_at']);

      // if (empresasData.length > 0) {
      //   await tx.insert(empresas).values(empresasData);
      //   eventEmitter.emit('restore-progress', `✅ Empresas restauradas: ${empresasData.length}`);
      // }
      if (rolesData.length > 0) {
        await tx.insert(roles).values(rolesData);
        eventEmitter.emit('restore-progress', `✅ Roles restaurados: ${rolesData.length}`);
      }
      // if (usersData.length > 0) {
      //   await tx.insert(users).values(usersData);
      //   eventEmitter.emit('restore-progress', `✅ Usuarios restaurados: ${usersData.length}`);
      // }
      if (clientesData.length > 0) {
        await tx.insert(clientes).values(clientesData);
        eventEmitter.emit('restore-progress', `✅ Clientes restaurados: ${clientesData.length}`);
      }
      if (proveedoresData.length > 0) {
        await tx.insert(proveedores).values(proveedoresData);
        eventEmitter.emit('restore-progress', `✅ Proveedores restaurados: ${proveedoresData.length}`);
      }
      if (categoriasData.length > 0) {
        await tx.insert(categorias).values(categoriasData);
        eventEmitter.emit('restore-progress', `✅ Categorías restauradas: ${categoriasData.length}`);
      }
      if (depositosData.length > 0) {
        await tx.insert(depositos).values(depositosData);
        eventEmitter.emit('restore-progress', `✅ Depósitos restaurados: ${depositosData.length}`);
      }
      if (ubicacionesData.length > 0) {
        await tx.insert(ubicaciones).values(ubicacionesData);
        eventEmitter.emit('restore-progress', `✅ Ubicaciones restauradas: ${ubicacionesData.length}`);
      }
      if (localizacionesData.length > 0) {
        await tx.insert(localizaciones).values(localizacionesData);
        eventEmitter.emit('restore-progress', `✅ Localizaciones restauradas: ${localizacionesData.length}`);
      }
      if (productosData.length > 0) {
        await tx.insert(productos).values(productosData);
        eventEmitter.emit('restore-progress', `✅ Productos restaurados: ${productosData.length}`);
      }
      if (productoCategoriasData.length > 0) {
        await tx.insert(productoCategorias).values(productoCategoriasData);
        eventEmitter.emit('restore-progress', `✅ Categorías de productos restauradas: ${productoCategoriasData.length}`);
      }
      if (stockData.length > 0) {
        await tx.insert(stockActual).values(stockData);
        eventEmitter.emit('restore-progress', `✅ Stock restaurado: ${stockData.length}`);
      }
      if (comprobantesData.length > 0) {
        await tx.insert(comprobantes).values(comprobantesData);
        eventEmitter.emit('restore-progress', `✅ Comprobantes restaurados: ${comprobantesData.length}`);
      }
      if (movimientosStockData.length > 0) {
        await tx.insert(movimientosStock).values(movimientosStockData);
        eventEmitter.emit('restore-progress', `✅ Movimientos de stock restaurados: ${movimientosStockData.length}`);
      }
      if (ventasData.length > 0) {
        await tx.insert(ventas).values(ventasData);
        eventEmitter.emit('restore-progress', `✅ Ventas restauradas: ${ventasData.length}`);
      }
      if (backup.detalleVentas && backup.detalleVentas.length > 0) {
        await tx.insert(detalleVentas).values(backup.detalleVentas);
        eventEmitter.emit('restore-progress', `✅ Detalles de ventas restaurados: ${backup.detalleVentas.length}`);
      }
      if (comprasData.length > 0) {
        await tx.insert(comprasProveedores).values(comprasData);
        eventEmitter.emit('restore-progress', `✅ Compras restauradas: ${comprasData.length}`);
      }
      if (backup.detalleCompras && backup.detalleCompras.length > 0) {
        await tx.insert(detalleCompras).values(backup.detalleCompras);
        eventEmitter.emit('restore-progress', `✅ Detalles de compras restaurados: ${backup.detalleCompras.length}`);
      }
      if (presupuestosData.length > 0) {
        await tx.insert(presupuesto).values(presupuestosData);
        eventEmitter.emit('restore-progress', `✅ Presupuestos restaurados: ${presupuestosData.length}`);
      }
      if (backup.detallePresupuesto && backup.detallePresupuesto.length > 0) {
        await tx.insert(detallePresupuesto).values(backup.detallePresupuesto);
        eventEmitter.emit('restore-progress', `✅ Detalles de presupuestos restaurados: ${backup.detallePresupuesto.length}`);
      }
      if (backup.puntosDeVenta && backup.puntosDeVenta.length > 0) {
        await tx.insert(puntosDeVenta).values(backup.puntosDeVenta);
        eventEmitter.emit('restore-progress', `✅ Puntos de venta restaurados: ${backup.puntosDeVenta.length}`);
      }
   
      if (comprobanteNumeracionData.length > 0) {
        await tx.insert(comprobanteNumeracion).values(comprobanteNumeracionData);
        eventEmitter.emit('restore-progress', `✅ Numeración de comprobantes restaurada: ${comprobanteNumeracionData.length}`);
      }
      if (backup.empresaConfigTienda && backup.empresaConfigTienda.length > 0) {
        await tx.insert(empresaConfigTienda).values(backup.empresaConfigTienda);
        eventEmitter.emit('restore-progress', `✅ Configuración de tienda restaurada: ${backup.empresaConfigTienda.length}`);
      }
      if (plantillasData.length > 0) {
        await tx.insert(plantillas).values(plantillasData);
        eventEmitter.emit('restore-progress', `✅ Plantillas restauradas: ${plantillasData.length}`);
      }
      if (backup.usuariosDepositos && backup.usuariosDepositos.length > 0) {
        await tx.insert(usuariosDepositos).values(backup.usuariosDepositos);
        eventEmitter.emit('restore-progress', `✅ Depósitos de usuarios restaurados: ${backup.usuariosDepositos.length}`);
      }
    });

    eventEmitter.emit('restore-complete', '✅ Restauración completada con éxito');

    return new Response(JSON.stringify({ message: 'Restauración completada con éxito' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error restaurando backup:', error);
    eventEmitter.emit('restore-error', `❌ Error: ${error.message}`)
    return new Response(
      JSON.stringify({
        error: 'Error restaurando backup',
        details: error instanceof Error ? error.message : error,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};