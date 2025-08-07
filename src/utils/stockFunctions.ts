import { and, asc, desc, eq, sql } from "drizzle-orm";
import db from "../db";
import {
  categorias,
  clientes,
  depositos,
  detalleVentas,
  movimientosStock,
  productos,
  proveedores,
  stockActual,
  ubicaciones,
} from "../db/schema";
import { cache } from "./cache";

export const trayendoProductos = async (
  empresaId: string,
  page: number = 0,
  limit: number = 20
) => {
  const offset = page * limit;
  const cacheKey = `stock_data_${empresaId}_${page}_${limit}`;
  // Check cache first
  const cachedData = await cache.get(cacheKey);
  if (cachedData) return cachedData;

  console.log('datos de ingresos ->',empresaId,page,limit,'offset',offset,'cacheKey',cacheKey)
  // Parallel query execution
  const [
    listaProductos,
    totalProductos,
    proveedoresData,
    clientesData,
    topMasVendidos,
    topMenosVendidos,
    stockMovimiento,
    resultado,
    categoriasData,
    ubicacionesData,
    depositosData,
  ] = await Promise.all([
    db
      .select({
        id: productos.id,
        codigoBarra: productos.codigoBarra,
        descripcion: productos.descripcion,
        categoria: productos.categoria,
        pCompra: productos.pCompra,
        pVenta: productos.pVenta,
        stock: productos.stock,
        srcPhoto: productos.srcPhoto,
        reservado: productos.reservado,
        reservadoOffLine: productos.reservadoOffLine,
        reservadoOnline: productos.reservadoOnline,
        localizacion: stockActual.localizacionesId,
        ubicaciones: stockActual.ubicacionesId,
        depositos: stockActual.depositosId,
        alertaStock: stockActual.alertaStock,
        ultimaActualizacion: productos.ultimaActualizacion,
        ventas: sql<number>`sum(${detalleVentas.cantidad})`.as("ventas"),
      })
      .from(productos)
      .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
      .leftJoin(detalleVentas, eq(detalleVentas.productoId, productos.id))
      .where(
        and(eq(productos.empresaId, empresaId), eq(productos.activo, true))
      )
      .groupBy(productos.id)
      .orderBy(desc(sql`ventas`))
      .limit(limit)
      .offset(offset),

    db
      .select({
        count: sql<number>`COUNT(*)`.as("total"),
      })
      .from(productos)
      .where(eq(productos.empresaId, empresaId))
      .then((result) => result.at(0)?.count ?? 0),

    db.select().from(proveedores).where(eq(proveedores.empresaId, empresaId)),

    db.select().from(clientes).where(eq(clientes.empresaId, empresaId)),

    db
      .select({
        producto: productos,
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as(
          "totalVendido"
        ),
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId))
      .groupBy(productos.id)
      .orderBy(desc(sql`totalVendido`))
      .limit(10),

    db
      .select({
        producto: productos,
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as(
          "totalVendido"
        ),
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId))
      .groupBy(productos.id)
      .orderBy(asc(sql`totalVendido`))
      .limit(10),

    db
      .select({
        producto: productos,
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as(
          "totalVendido"
        ),
        totalIngresos:
          sql<number>`COALESCE(SUM(CASE WHEN ${movimientosStock.tipo} = 'ingreso' THEN ${movimientosStock.cantidad} ELSE 0 END), 0)`.as(
            "totalIngresos"
          ),
        totalEgresos:
          sql<number>`COALESCE(SUM(CASE WHEN ${movimientosStock.tipo} = 'egreso' THEN ${movimientosStock.cantidad} ELSE 0 END), 0)`.as(
            "totalEgresos"
          ),
      })
      .from(productos)
      .leftJoin(detalleVentas, eq(detalleVentas.productoId, productos.id))
      .leftJoin(movimientosStock, eq(movimientosStock.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId))
      .groupBy(productos.id)
      .orderBy(asc(sql`totalVendido`))
      .limit(10),

    db
      .select({
        categorias: productos.categoria,
        ubicaciones: stockActual.ubicacionesId  ,
        depositos: stockActual.depositosId,
      })
      .from(productos)
      .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId)),
    db.select().from(categorias).where(eq(categorias.empresaId, empresaId)),
    db.select().from(ubicaciones).where(eq(ubicaciones.empresaId, empresaId)),
    db.select().from(depositos).where(eq(depositos.empresaId, empresaId)),
  ]);
  console.log('ubicaciones y depositos ->', resultado)
// mapeando solo las categorias traidas desde la base de datos de categorias, falta otras
console.log("categoriasData", ubicacionesData,depositosData);
  const obtenerFiltros = {
    categorias: Array.from(new Set(categoriasData.map((r) => ({nombre:r.nombre, id:r.id})))), 
    ubicaciones: Array.from(new Set(ubicacionesData.map((r,i) => ({nombre:r.nombre, id:i})))), 
    depositos: Array.from(new Set(depositosData.map((r,i) => ({nombre:r.nombre, id:i})))), 
  };

  const finalResult = {
    obtenerFiltros,
    listaProductos,
    proveedoresData,
    clientesData,
    topMasVendidos,
    topMenosVendidos,
    stockMovimiento,
    totalProductos,
  };

  // Cache the result for future requests
  await cache.set(cacheKey, finalResult, 75); // Cache for 5 minutes

  return finalResult;
};