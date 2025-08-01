import type { APIRoute } from 'astro';
import { productos,movimientosStock as movimientos } from '../../../db/schema';

import { eq, sql, desc, asc } from 'drizzle-orm';
import db from '../../../db';
import { createResponse } from '../../../types';

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔍 Iniciando petición GET a statistStock');
    const empresaId = request.headers.get('xx-empresa-id');
    const userId = request.headers.get('x-user-id');
    console.log('👤 UserId recibido:', userId);
    
    if (!userId) {
      console.log('❌ Error: No se recibió userId');
      return new Response(JSON.stringify({ error: 'Usuario no autorizado' }), { 
        status: 401 
      });
    }

    console.log('📊 Iniciando consulta de listaProductos...');
    const listaProductos = await db
      .select({
        id: productos.id,
        codigoBarra: productos.codigoBarra,
        descripcion: productos.descripcion,
        categoria: productos.categoria,
        pCompra: productos.pCompra,
        pVenta: productos.pVenta,
        stock: productos.stock,
        ultimaActualizacion: productos.ultimaActualizacion,
        totalMovimientos: sql<number>`count(${movimientos.id})`,
        totalVendido: sql<number>`sum(case when ${movimientos.tipo} = 'egreso' then ${movimientos.cantidad} else 0 end)`
      })
      .from(productos)
      .leftJoin(movimientos, eq(productos.id, movimientos.productoId))
      .where(eq(productos.empresaId,empresaId))
      .groupBy(productos.id);
    
    console.log('✅ ListaProductos obtenida:', listaProductos.length, 'productos');

    console.log('📈 Iniciando consulta de topMasVendidos...');
    const topMasVendidos = await db
      .select({
        id: productos.id,
        nombre:productos.nombre,
        descripcion: productos.descripcion,
        totalVendido: sql<number>`sum(case when ${movimientos.tipo} = 'egreso' then ${movimientos.cantidad} else 0 end)`
      })
      .from(productos)
      .leftJoin(movimientos, eq(productos.id, movimientos.productoId))
      .where(eq(productos.empresaId,empresaId))
      .groupBy(productos.id)
      .orderBy(desc(sql`totalVendido`))
      .limit(5);
    
    console.log('✅ TopMasVendidos obtenido:', topMasVendidos.length, 'productos');

    console.log('📉 Iniciando consulta de topMenosVendidos...');
    const topMenosVendidos = await db
      .select({
        id: productos.id,
        nombre:productos.nombre,
        descripcion: productos.descripcion,
        totalVendido: sql<number>`sum(case when ${movimientos.tipo} = 'egreso' then ${movimientos.cantidad} else 0 end)`
      })
      .from(productos)
      .leftJoin(movimientos, eq(productos.id, movimientos.productoId))
      .where(eq(productos.empresaId,empresaId))
      .groupBy(productos.id)
      .orderBy(asc(sql`totalVendido`))
      .limit(5);
    
    console.log('✅ TopMenosVendidos obtenido:', topMenosVendidos.length, 'productos');

    console.log('🔄 Iniciando consulta de stockMovimiento...');
    const stockMovimiento = await db
      .select({
        id: productos.id,
        nombre:productos.nombre,
        descripcion: productos.descripcion,
        totalMovimientos: sql<number>`count(${movimientos.id})`
      })
      .from(productos)
      .leftJoin(movimientos, eq(productos.id, movimientos.productoId))
      .where(eq(productos.empresaId,empresaId))
      .groupBy(productos.id)
      .orderBy(asc(sql`totalMovimientos`))
      .limit(5);
    
    console.log('✅ StockMovimiento obtenido:', stockMovimiento.length, 'productos');

    const response = {
      listaProductos,
      topMasVendidos,
      topMenosVendidos,
      stockMovimiento
    };

    console.log('📦 Respuesta final:', {
      totalProductos: listaProductos.length,
      totalTopMasVendidos: topMasVendidos.length,
      totalTopMenosVendidos: topMenosVendidos.length,
      totalStockMovimiento: stockMovimiento.length
    });

    return createResponse(200,response,'datos obtenidos exitosamente')
  } catch (error) {
    console.error('❌ Error en statistStock:', error);
    return createResponse(500,{error: 'Error interno del servidor'},'Error interno del servidor')
  }
};