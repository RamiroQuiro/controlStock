import type { APIRoute } from 'astro';
import db from '../../../db';
import {
  productos,
  clientes,
  proveedores,
  stockActual,
  comprasProveedores,
  ventas,
  detalleVentas,
  detalleCompras,
  detallePresupuesto,
  movimientosStock,
  presupuesto,
} from '../../../db/schema';
import { eq, inArray } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  const userId = user.id;

  try {
    const formData = await request.formData();
    const file = formData.get('backup') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No se subió archivo' }), {
        status: 400,
      });
    }

    const text = await file.text();
    const data = JSON.parse(text);

    console.log('📦 Restaurando backup…');

    await db.transaction(async (tx) => {
      // Validar que los datos estén presentes
      const {
        ventas: ventasData = [],
        presupuestos: presupuestosData = [],
        clientes: clientesData = [],
        compras: comprasData = [],
        productos: productosData = [],
        detalleCompras: detalleComprasData = [],
        detalleVentas: detalleVentasData = [],
        detallePresupuesto: detallePresupuestoData = [],
        movimientosStock: movimientosStockData = [],
        proveedores: proveedoresData = [],
        stock: stockData = [],
        roles: rolesData = [],
      } = data;

      console.log('🧹 Borrando datos existentes…');

      console.log('maver movimientosStock', movimientosStockData);
      if (movimientosStockData.length > 0) {
        await tx
          .delete(movimientosStock)
          .where(eq(movimientosStock.userId, userId));
        console.log(
          `🗑️ Movimientos de stock eliminados: ${movimientosStockData.length}`
        );
      }
      if (stockData.length > 0) {
        await tx.delete(stockActual).where(eq(stockActual.id, userId));
        console.log(`🗑️ Stock actual eliminado: ${stockData.length}`);
      }
      // Borrar detalles primero (dependen de otros)
      if (ventasData.length > 0) {
        await tx.delete(detalleVentas).where(
          inArray(
            detalleVentas.ventaId,
            ventasData.map((v) => v.id)
          )
        );
        await tx.delete(ventas).where(eq(ventas.userId, userId));
        console.log(`🗑️ Ventas y detalles eliminados: ${ventasData.length}`);
      }

      console.log('maver presupuesto', presupuestosData);
      if (presupuestosData.length > 0) {
        await tx.delete(detallePresupuesto).where(
          inArray(
            detallePresupuesto.presupuestoId,
            presupuestosData.map((p) => p.id)
          )
        );
        await tx.delete(presupuesto).where(eq(presupuesto.userId, userId));
        console.log(`🗑️ Presupuestos eliminados: ${presupuestosData.length}`);
      }

      console.log('maver comprasData', comprasData);
      if (comprasData.length > 0) {
        await tx.delete(detalleCompras).where(
          inArray(
            detalleCompras.compraId,
            comprasData.map((c) => c.id)
          )
        );
        await tx
          .delete(comprasProveedores)
          .where(eq(comprasProveedores.userId, userId));
        console.log(`🗑️ Compras eliminadas: ${comprasData.length}`);
      }

      await tx.delete(stockActual).where(
        inArray(
          stockActual.productoId,
          productosData.map((p) => p.id)
        )
      );

      console.log('maver productos', productosData);
      if (productosData.length > 0) {
        await tx.delete(productos).where(
          inArray(
            productos.id,
            productosData.map((p) => p.id)
          )
        );
        console.log(`🗑️ Productos eliminados: ${productosData.length}`);
      }

      console.log('maver clientes', clientesData);
      if (clientesData.length > 0) {
        await tx.delete(clientes).where(
          inArray(
            clientes.id,
            clientesData.map((c) => c.id)
          )
        );
        console.log(`🗑️ Clientes eliminados: ${clientesData.length}`);
      }

      console.log('maver proveedores', proveedoresData);
      if (proveedoresData.length > 0) {
        await tx.delete(proveedores).where(
          inArray(
            proveedores.id,
            proveedoresData.map((p) => p.id)
          )
        );
        console.log(`🗑️ Proveedores eliminados: ${proveedoresData.length}`);
      }

      console.log('📥 Insertando datos del backup…');

      // Insertar ordenado
      if (productosData.length) {
        await tx.insert(productos).values(productosData);
        console.log(`✅ Productos restaurados: ${productosData.length}`);
      }
      if (clientesData.length) {
        await tx.insert(clientes).values(clientesData);
        console.log(`✅ Clientes restaurados: ${clientesData.length}`);
      }
      if (proveedoresData.length) {
        await tx.insert(proveedores).values(proveedoresData);
        console.log(`✅ Proveedores restaurados: ${proveedoresData.length}`);
      }
      if (stockData.length) {
        await tx.insert(stockActual).values(stockData);
        console.log(`✅ Stock restaurado: ${stockData.length}`);
      }
      if (movimientosStockData.length) {
        await tx.insert(movimientosStock).values(movimientosStockData);
        console.log(
          `✅ Movimientos de stock restaurados: ${movimientosStockData.length}`
        );
      }
      if (comprasData.length) {
        await tx.insert(comprasProveedores).values(comprasData);
        console.log(`✅ Compras restauradas: ${comprasData.length}`);
      }
      if (ventasData.length) {
        await tx.insert(ventas).values(ventasData);
        console.log(`✅ Ventas restauradas: ${ventasData.length}`);
      }
      if (rolesData.length) {
        await tx.insert(roles).values(rolesData);
        console.log(`✅ Roles restaurados: ${rolesData.length}`);
      }

      console.log('✅ Restauración completada con éxito');
    });

    return new Response(
      JSON.stringify({ status: 'Backup restaurado con éxito' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error restaurando backup:', error);
    return new Response(
      JSON.stringify({
        error: 'Error restaurando backup',
        details: error instanceof Error ? error.message : error,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
