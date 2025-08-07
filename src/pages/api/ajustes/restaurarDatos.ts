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

    console.log('📦 Restaurando backup…');

    await db.transaction(async (tx) => {
      console.log('🧹 Borrando datos existentes…');

      // 1. Delete existing data
      const ventasIds = await tx
        .select({ id: ventas.id })
        .from(ventas)
        .where(eq(ventas.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (ventasIds.length > 0) {
        await tx.delete(detalleVentas).where(inArray(detalleVentas.ventaId, ventasIds));
        console.log(`🗑️ Detalles de ventas eliminados: ${ventasIds.length}`);
      }

      const comprasIds = await tx
        .select({ id: comprasProveedores.id })
        .from(comprasProveedores)
        .where(eq(comprasProveedores.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (comprasIds.length > 0) {
        await tx.delete(detalleCompras).where(inArray(detalleCompras.compraId, comprasIds));
        console.log(`🗑️ Detalles de compras eliminados: ${comprasIds.length}`);
      }

      const presupuestoIds = await tx
        .select({ id: presupuesto.id })
        .from(presupuesto)
        .where(eq(presupuesto.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (presupuestoIds.length > 0) {
        await tx.delete(detallePresupuesto).where(inArray(detallePresupuesto.presupuestoId, presupuestoIds));
        console.log(`🗑️ Detalles de presupuestos eliminados: ${presupuestoIds.length}`);
      }

      const productoIds = await tx
        .select({ id: productos.id })
        .from(productos)
        .where(eq(productos.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (productoIds.length > 0) {
        await tx.delete(productoCategorias).where(inArray(productoCategorias.productoId, productoIds));
        console.log(`🗑️ Categorías de productos eliminadas: ${productoIds.length}`);
      }

      const userIds = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.empresaId, empresaId))
        .then((res) => res.map((r) => r.id));
      if (userIds.length > 0) {
        await tx.delete(usuariosDepositos).where(inArray(usuariosDepositos.usuarioId, userIds));
        console.log(`🗑️ Depósitos de usuarios eliminados: ${userIds.length}`);
      }

      await tx.delete(movimientosStock).where(eq(movimientosStock.empresaId, empresaId));
      console.log('🗑️ Movimientos de stock eliminados');
      await tx.delete(stockActual).where(eq(stockActual.empresaId, empresaId));
      console.log('🗑️ Stock actual eliminado');
      await tx.delete(ventas).where(eq(ventas.empresaId, empresaId));
      console.log('🗑️ Ventas eliminadas');
      await tx.delete(comprasProveedores).where(eq(comprasProveedores.empresaId, empresaId));
      console.log('🗑️ Compras eliminadas');
      await tx.delete(presupuesto).where(eq(presupuesto.empresaId, empresaId));
      console.log('🗑️ Presupuestos eliminados');
      await tx.delete(productos).where(eq(productos.empresaId, empresaId));
      console.log('🗑️ Productos eliminados');
      await tx.delete(clientes).where(eq(clientes.empresaId, empresaId));
      console.log('🗑️ Clientes eliminados');
      await tx.delete(proveedores).where(eq(proveedores.empresaId, empresaId));
      console.log('🗑️ Proveedores eliminados');
      await tx.delete(comprobanteNumeracion).where(eq(comprobanteNumeracion.empresaId, empresaId));
      console.log('🗑️ Numeración de comprobantes eliminada');
      await tx.delete(comprobantes).where(eq(comprobantes.empresaId, empresaId));
      console.log('🗑️ Comprobantes eliminados');
      await tx.delete(puntosDeVenta).where(eq(puntosDeVenta.empresaId, empresaId));
      console.log('🗑️ Puntos de venta eliminados');
      await tx.delete(empresaConfigTienda).where(eq(empresaConfigTienda.empresaId, empresaId));
      console.log('🗑️ Configuración de tienda eliminada');
      await tx.delete(plantillas).where(eq(plantillas.empresaId, empresaId));
      console.log('🗑️ Plantillas eliminadas');
      await tx.delete(localizaciones).where(eq(localizaciones.empresaId, empresaId));
      console.log('🗑️ Localizaciones eliminadas');
      await tx.delete(ubicaciones).where(eq(ubicaciones.empresaId, empresaId));
      console.log('🗑️ Ubicaciones eliminadas');
      await tx.delete(depositos).where(eq(depositos.empresaId, empresaId));
      console.log('🗑️ Depósitos eliminados');
      await tx.delete(categorias).where(eq(categorias.empresaId, empresaId));
      console.log('🗑️ Categorías eliminadas');
      await tx.delete(roles).where(eq(roles.empresaId, empresaId));
      console.log('🗑️ Roles eliminados');

      console.log('📥 Insertando datos del backup…');
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
      //   console.log(`✅ Empresas restauradas: ${empresasData.length}`);
      // }
      if (rolesData.length > 0) {
        await tx.insert(roles).values(rolesData);
        console.log(`✅ Roles restaurados: ${rolesData.length}`);
      }
      // if (usersData.length > 0) {
      //   await tx.insert(users).values(usersData);
      //   console.log(`✅ Usuarios restaurados: ${usersData.length}`);
      // }
      if (clientesData.length > 0) {
        await tx.insert(clientes).values(clientesData);
        console.log(`✅ Clientes restaurados: ${clientesData.length}`);
      }
      if (proveedoresData.length > 0) {
        await tx.insert(proveedores).values(proveedoresData);
        console.log(`✅ Proveedores restaurados: ${proveedoresData.length}`);
      }
      if (categoriasData.length > 0) {
        await tx.insert(categorias).values(categoriasData);
        console.log(`✅ Categorías restauradas: ${categoriasData.length}`);
      }
      if (depositosData.length > 0) {
        await tx.insert(depositos).values(depositosData);
        console.log(`✅ Depósitos restaurados: ${depositosData.length}`);
      }
      if (ubicacionesData.length > 0) {
        await tx.insert(ubicaciones).values(ubicacionesData);
        console.log(`✅ Ubicaciones restauradas: ${ubicacionesData.length}`);
      }
      if (localizacionesData.length > 0) {
        await tx.insert(localizaciones).values(localizacionesData);
        console.log(`✅ Localizaciones restauradas: ${localizacionesData.length}`);
      }
      if (productosData.length > 0) {
        await tx.insert(productos).values(productosData);
        console.log(`✅ Productos restaurados: ${productosData.length}`);
      }
      if (productoCategoriasData.length > 0) {
        await tx.insert(productoCategorias).values(productoCategoriasData);
        console.log(`✅ Categorías de productos restauradas: ${productoCategoriasData.length}`);
      }
      if (stockData.length > 0) {
        await tx.insert(stockActual).values(stockData);
        console.log(`✅ Stock restaurado: ${stockData.length}`);
      }
      if (comprobantesData.length > 0) {
        await tx.insert(comprobantes).values(comprobantesData);
        console.log(`✅ Comprobantes restaurados: ${comprobantesData.length}`);
      }
      if (movimientosStockData.length > 0) {
        await tx.insert(movimientosStock).values(movimientosStockData);
        console.log(`✅ Movimientos de stock restaurados: ${movimientosStockData.length}`);
      }
      if (ventasData.length > 0) {
        await tx.insert(ventas).values(ventasData);
        console.log(`✅ Ventas restauradas: ${ventasData.length}`);
      }
      if (backup.detalleVentas && backup.detalleVentas.length > 0) {
        await tx.insert(detalleVentas).values(backup.detalleVentas);
        console.log(`✅ Detalles de ventas restaurados: ${backup.detalleVentas.length}`);
      }
      if (comprasData.length > 0) {
        await tx.insert(comprasProveedores).values(comprasData);
        console.log(`✅ Compras restauradas: ${comprasData.length}`);
      }
      if (backup.detalleCompras && backup.detalleCompras.length > 0) {
        await tx.insert(detalleCompras).values(backup.detalleCompras);
        console.log(`✅ Detalles de compras restaurados: ${backup.detalleCompras.length}`);
      }
      if (presupuestosData.length > 0) {
        await tx.insert(presupuesto).values(presupuestosData);
        console.log(`✅ Presupuestos restaurados: ${presupuestosData.length}`);
      }
      if (backup.detallePresupuesto && backup.detallePresupuesto.length > 0) {
        await tx.insert(detallePresupuesto).values(backup.detallePresupuesto);
        console.log(`✅ Detalles de presupuestos restaurados: ${backup.detallePresupuesto.length}`);
      }
      if (backup.puntosDeVenta && backup.puntosDeVenta.length > 0) {
        await tx.insert(puntosDeVenta).values(backup.puntosDeVenta);
        console.log(`✅ Puntos de venta restaurados: ${backup.puntosDeVenta.length}`);
      }
   
      if (comprobanteNumeracionData.length > 0) {
        await tx.insert(comprobanteNumeracion).values(comprobanteNumeracionData);
        console.log(`✅ Numeración de comprobantes restaurada: ${comprobanteNumeracionData.length}`);
      }
      if (backup.empresaConfigTienda && backup.empresaConfigTienda.length > 0) {
        await tx.insert(empresaConfigTienda).values(backup.empresaConfigTienda);
        console.log(`✅ Configuración de tienda restaurada: ${backup.empresaConfigTienda.length}`);
      }
      if (plantillasData.length > 0) {
        await tx.insert(plantillas).values(plantillasData);
        console.log(`✅ Plantillas restauradas: ${plantillasData.length}`);
      }
      if (backup.usuariosDepositos && backup.usuariosDepositos.length > 0) {
        await tx.insert(usuariosDepositos).values(backup.usuariosDepositos);
        console.log(`✅ Depósitos de usuarios restaurados: ${backup.usuariosDepositos.length}`);
      }
    });

    return new Response(JSON.stringify({ message: 'Restauración completada con éxito' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error restaurando backup:', error);
    return new Response(
      JSON.stringify({
        error: 'Error restaurando backup',
        details: error instanceof Error ? error.message : error,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};