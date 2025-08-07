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
  localizaciones
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
    const [      productosData,      clientesData,      proveedoresData,      ventasData,      comprasData,      presupuestosData,      usuariosData,      rolesData,      categoriasData,      depositosData,      ubicacionesData,      comprobantesData,      comprobanteNumeracionData,      puntosDeVentaData,      empresaConfigTiendaData,      plantillasData,      localizacionData,      stockData,      movimientosStockData,    ] = await Promise.all([
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

