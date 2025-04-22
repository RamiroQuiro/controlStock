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
} from '../../../db/schema';
import JSZip from 'jszip';
import { eq, inArray } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const { user, session } = locals;
  console.log('session', user);
  try {
    const movimientosStockData = await db
      .select()
      .from(movimientosStock)
      .where(eq(movimientosStock.userId, user.id));
    const presupuestosData = await db
      .select()
      .from(presupuesto)
      .where(eq(presupuesto.userId, user.id));
    const productosData = await db
      .select()
      .from(productos)
      .where(eq(productos.userId, user.id));
    const clientesData = await db
      .select()
      .from(clientes)
      .where(eq(clientes.userId, user.id));
    const proveedoresData = await db
      .select()
      .from(proveedores)
      .where(eq(proveedores.userId, user.id));
    const ventasData = await db
      .select()
      .from(ventas)
      .where(eq(ventas.userId, user.id));
    const comprasData = await db
      .select()
      .from(comprasProveedores)
      .where(eq(comprasProveedores.userId, user.id));
    const stockData = await db
      .select()
      .from(stockActual)
      .where(
        inArray(
          stockActual.productoId,
          productosData.map((p) => p.id)
        )
      );
    const usuariosData = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    const rolesData = await db
      .select()
      .from(roles)
      .where(eq(roles.creadoPor, user.id));
    const detalleVentasData = await db
      .select()
      .from(detalleVentas)
      .where(
        inArray(
          detalleVentas.ventaId,
          ventasData.map((v) => v.id)
        )
      );
    const detalleComprasData = await db
      .select()
      .from(detalleCompras)
      .where(
        inArray(
          detalleCompras.compraId,
          comprasData.map((c) => c.id)
        )
      );
    const detallePresupuestoData = await db
      .select()
      .from(detallePresupuesto)
      .where(
        inArray(
          detallePresupuesto.presupuestoId,
          presupuestosData.map((p) => p.id)
        )
      );

    // Armar el objeto de backup
    const backup = {
      fecha: new Date().toISOString(),
      detalleVentas: detalleVentasData,
      detalleCompras: detalleComprasData,
      detallePresupuesto: detallePresupuestoData,
      productos: productosData,
      clientes: clientesData,
      presupuestos: presupuestosData,
      movimientosStock: movimientosStockData,
      proveedores: proveedoresData,
      ventas: ventasData,
      compras: comprasData,
      stock: stockData,
      usuarios: usuariosData,
      roles: rolesData,
    };

    // Convertir a JSON
    const json = JSON.stringify(backup, null, 2);

    // Crear ZIP
    const zip = new JSZip();
    zip.file(`backup_controlstock_${Date.now()}.json`, json);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // Devolver ZIP como descarga
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
