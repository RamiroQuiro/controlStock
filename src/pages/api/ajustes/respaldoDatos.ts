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
import JSZip from 'jszip';
import { eq, inArray } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const { user } = locals;

  if (!user || !user.empresaId) {
    return new Response(JSON.stringify({ error: 'Usuario no autenticado o sin empresa asignada' }), {
      status: 401,
    });
  }

  const { empresaId } = user;

  try {
    // 1. Obtener todas las entidades principales de la empresa
    const [      productosData,      clientesData,      proveedoresData,      ventasData,      comprasData,      presupuestosData,      usuariosData,      rolesData,      categoriasData,      depositosData,      ubicacionesData,      comprobantesData,      comprobanteNumeracionData,      puntosDeVentaData,      empresaConfigTiendaData,      plantillasData,      localizacionData,      stockData,      movimientosStockData,      empresasData,    ] = await Promise.all([
      db.select().from(productos).where(eq(productos.empresaId, empresaId)),
      db.select().from(clientes).where(eq(clientes.empresaId, empresaId)),
      db.select().from(proveedores).where(eq(proveedores.empresaId, empresaId)),
      db.select().from(ventas).where(eq(ventas.empresaId, empresaId)),
      db.select().from(comprasProveedores).where(eq(comprasProveedores.empresaId, empresaId)),
      db.select().from(presupuesto).where(eq(presupuesto.empresaId, empresaId)),
      db.select().from(users).where(eq(users.empresaId, empresaId)),
      db.select().from(roles).where(eq(roles.empresaId, empresaId)),
      db.select().from(categorias).where(eq(categorias.empresaId, empresaId)),
      db.select().from(depositos).where(eq(depositos.empresaId, empresaId)),
      db.select().from(ubicaciones).where(eq(ubicaciones.empresaId, empresaId)),
      db.select().from(comprobantes).where(eq(comprobantes.empresaId, empresaId)),
      db.select().from(comprobanteNumeracion).where(eq(comprobanteNumeracion.empresaId, empresaId)),
      db.select().from(puntosDeVenta).where(eq(puntosDeVenta.empresaId, empresaId)),
      db.select().from(empresaConfigTienda).where(eq(empresaConfigTienda.empresaId, empresaId)),
      db.select().from(plantillas).where(eq(plantillas.empresaId, empresaId)),
      db.select().from(localizaciones).where(eq(localizaciones.empresaId, empresaId)),
      db.select().from(stockActual).where(eq(stockActual.empresaId, empresaId)),
      db.select().from(movimientosStock).where(eq(movimientosStock.empresaId, empresaId)),
      db.select().from(empresas).where(eq(empresas.id, empresaId)),
    ]);

    // 2. Obtener tablas de relación basadas en los resultados anteriores
    const [      detalleVentasData,      detalleComprasData,      detallePresupuestoData,      productoCategoriasData,      usuariosDepositosData,    ] = await Promise.all([
      ventasData.length ? db.select().from(detalleVentas).where(inArray(detalleVentas.ventaId, ventasData.map(v => v.id))) : Promise.resolve([]),
      comprasData.length ? db.select().from(detalleCompras).where(inArray(detalleCompras.compraId, comprasData.map(c => c.id))) : Promise.resolve([]),
      presupuestosData.length ? db.select().from(detallePresupuesto).where(inArray(detallePresupuesto.presupuestoId, presupuestosData.map(p => p.id))) : Promise.resolve([]),
      productosData.length ? db.select().from(productoCategorias).where(inArray(productoCategorias.productoId, productosData.map(p => p.id))) : Promise.resolve([]),
      usuariosData.length ? db.select().from(usuariosDepositos).where(inArray(usuariosDepositos.usuarioId, usuariosData.map(u => u.id))) : Promise.resolve([]),
    ]);

    // 3. Armar el objeto de backup
    const backup = {
      fecha: new Date().toISOString(),
      empresas: empresasData,
      users: usuariosData,
      roles: rolesData,
      clientes: clientesData,
      proveedores: proveedoresData,
      categorias: categoriasData,
      depositos: depositosData,
      ubicaciones: ubicacionesData,
      localizaciones: localizacionData,
      productos: productosData,
      productoCategorias: productoCategoriasData,
      stock: stockData,
      movimientosStock: movimientosStockData,
      ventas: ventasData,
      detalleVentas: detalleVentasData,
      compras: comprasData,
      detalleCompras: detalleComprasData,
      presupuestos: presupuestosData,
      detallePresupuesto: detallePresupuestoData,
      puntosDeVenta: puntosDeVentaData,
      comprobantes: comprobantesData,
      comprobanteNumeracion: comprobanteNumeracionData,
      empresaConfigTienda: empresaConfigTiendaData,
      plantillas: plantillasData,
      usuariosDepositos: usuariosDepositosData,
    };

    const json = JSON.stringify(backup, null, 2);
    const zip = new JSZip();
    zip.file(`backup_controlstock_${Date.now()}.json`, json);
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    return new Response(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=backup_controlstock_${Date.now()}.zip`,
      },
    });
  } catch (error) {
    console.error('Error generando backup:', error);
    return new Response(
      JSON.stringify({
        error: 'Error generando backup',
        details: error instanceof Error ? error.message : error,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
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
		const file = formData.get('backupFile') as File;

		if (!file) {
			return new Response(JSON.stringify({ error: 'No se proporcionó ningún archivo' }), {
				status: 400,
			});
		}

		const zip = new JSZip();
		const content = await zip.loadAsync(await file.arrayBuffer());
		const jsonFileKey = Object.keys(content.files).find(name => name.endsWith('.json'));

		if (!jsonFileKey) {
			return new Response(JSON.stringify({ error: 'El archivo ZIP no contiene un archivo JSON' }), {
				status: 400,
			});
		}

		const jsonFile = content.files[jsonFileKey];
		const backupData = JSON.parse(await jsonFile.async('string'));

		await db.transaction(async tx => {
			// 1. Delete existing data
			const ventasIds = await tx
				.select({ id: ventas.id })
				.from(ventas)
				.where(eq(ventas.empresaId, empresaId))
				.then(res => res.map(r => r.id));
			if (ventasIds.length > 0) await tx.delete(detalleVentas).where(inArray(detalleVentas.ventaId, ventasIds));

			const comprasIds = await tx
				.select({ id: comprasProveedores.id })
				.from(comprasProveedores)
				.where(eq(comprasProveedores.empresaId, empresaId))
				.then(res => res.map(r => r.id));
			if (comprasIds.length > 0)
				await tx.delete(detalleCompras).where(inArray(detalleCompras.compraId, comprasIds));

			const presupuestoIds = await tx
				.select({ id: presupuesto.id })
				.from(presupuesto)
				.where(eq(presupuesto.empresaId, empresaId))
				.then(res => res.map(r => r.id));
			if (presupuestoIds.length > 0)
				await tx.delete(detallePresupuesto).where(inArray(detallePresupuesto.presupuestoId, presupuestoIds));

			const productoIds = await tx
				.select({ id: productos.id })
				.from(productos)
				.where(eq(productos.empresaId, empresaId))
				.then(res => res.map(r => r.id));
			if (productoIds.length > 0)
				await tx.delete(productoCategorias).where(inArray(productoCategorias.productoId, productoIds));

			const userIds = await tx
				.select({ id: users.id })
				.from(users)
				.where(eq(users.empresaId, empresaId))
				.then(res => res.map(r => r.id));
			if (userIds.length > 0)
				await tx.delete(usuariosDepositos).where(inArray(usuariosDepositos.usuarioId, userIds));

			await tx.delete(movimientosStock).where(eq(movimientosStock.empresaId, empresaId));
			await tx.delete(stockActual).where(eq(stockActual.empresaId, empresaId));
			await tx.delete(ventas).where(eq(ventas.empresaId, empresaId));
			await tx.delete(comprasProveedores).where(eq(comprasProveedores.empresaId, empresaId));
			await tx.delete(presupuesto).where(eq(presupuesto.empresaId, empresaId));
			await tx.delete(productos).where(eq(productos.empresaId, empresaId));
			await tx.delete(clientes).where(eq(clientes.empresaId, empresaId));
			await tx.delete(proveedores).where(eq(proveedores.empresaId, empresaId));
			await tx.delete(comprobanteNumeracion).where(eq(comprobanteNumeracion.empresaId, empresaId));
			await tx.delete(comprobantes).where(eq(comprobantes.empresaId, empresaId));
			await tx.delete(puntosDeVenta).where(eq(puntosDeVenta.empresaId, empresaId));
			await tx.delete(empresaConfigTienda).where(eq(empresaConfigTienda.empresaId, empresaId));
			await tx.delete(plantillas).where(eq(plantillas.empresaId, empresaId));
			await tx.delete(localizaciones).where(eq(localizaciones.empresaId, empresaId));
			await tx.delete(ubicaciones).where(eq(ubicaciones.empresaId, empresaId));
			await tx.delete(depositos).where(eq(depositos.empresaId, empresaId));
			await tx.delete(categorias).where(eq(categorias.empresaId, empresaId));
			await tx.delete(users).where(eq(users.empresaId, empresaId));
			await tx.delete(roles).where(eq(roles.empresaId, empresaId));
      await tx.delete(empresas).where(eq(empresas.id, empresaId));

			// 2. Insert restored data
			const backup = backupData as any;

      if (backup.empresas && backup.empresas.length > 0) await tx.insert(empresas).values(backup.empresas);
			if (backup.roles && backup.roles.length > 0) await tx.insert(roles).values(backup.roles);
			if (backup.users && backup.users.length > 0) await tx.insert(users).values(backup.users);
			if (backup.clientes && backup.clientes.length > 0) await tx.insert(clientes).values(backup.clientes);
			if (backup.proveedores && backup.proveedores.length > 0)
				await tx.insert(proveedores).values(backup.proveedores);
			if (backup.categorias && backup.categorias.length > 0)
				await tx.insert(categorias).values(backup.categorias);
			if (backup.depositos && backup.depositos.length > 0) await tx.insert(depositos).values(backup.depositos);
			if (backup.ubicaciones && backup.ubicaciones.length > 0)
				await tx.insert(ubicaciones).values(backup.ubicaciones);
			if (backup.localizaciones && backup.localizaciones.length > 0)
				await tx.insert(localizaciones).values(backup.localizaciones);
			if (backup.productos && backup.productos.length > 0) await tx.insert(productos).values(backup.productos);
			if (backup.productoCategorias && backup.productoCategorias.length > 0)
				await tx.insert(productoCategorias).values(backup.productoCategorias);
			if (backup.stock && backup.stock.length > 0) await tx.insert(stockActual).values(backup.stock);
			if (backup.movimientosStock && backup.movimientosStock.length > 0)
				await tx.insert(movimientosStock).values(backup.movimientosStock);
			if (backup.ventas && backup.ventas.length > 0) await tx.insert(ventas).values(backup.ventas);
			if (backup.detalleVentas && backup.detalleVentas.length > 0)
				await tx.insert(detalleVentas).values(backup.detalleVentas);
			if (backup.compras && backup.compras.length > 0)
				await tx.insert(comprasProveedores).values(backup.compras);
			if (backup.detalleCompras && backup.detalleCompras.length > 0)
				await tx.insert(detalleCompras).values(backup.detalleCompras);
			if (backup.presupuestos && backup.presupuestos.length > 0)
				await tx.insert(presupuesto).values(backup.presupuestos);
			if (backup.detallePresupuesto && backup.detallePresupuesto.length > 0)
				await tx.insert(detallePresupuesto).values(backup.detallePresupuesto);
			if (backup.puntosDeVenta && backup.puntosDeVenta.length > 0)
				await tx.insert(puntosDeVenta).values(backup.puntosDeVenta);
			if (backup.comprobantes && backup.comprobantes.length > 0)
				await tx.insert(comprobantes).values(backup.comprobantes);
			if (backup.comprobanteNumeracion && backup.comprobanteNumeracion.length > 0)
				await tx.insert(comprobanteNumeracion).values(backup.comprobanteNumeracion);
			if (backup.empresaConfigTienda && backup.empresaConfigTienda.length > 0)
				await tx.insert(empresaConfigTienda).values(backup.empresaConfigTienda);
			if (backup.plantillas && backup.plantillas.length > 0)
				await tx.insert(plantillas).values(backup.plantillas);
			if (backup.usuariosDepositos && backup.usuariosDepositos.length > 0)
				await tx.insert(usuariosDepositos).values(backup.usuariosDepositos);
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

