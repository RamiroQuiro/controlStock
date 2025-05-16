import { and, asc, desc, eq, sql } from "drizzle-orm";
import db from "../db";
import { clientes, detalleVentas, movimientosStock, productos, proveedores, stockActual } from "../db/schema";
import { cache } from "./cache"; 

export const trayendoProductos = async (empresaId: string, page: number = 0, limit: number = 20) => {
  const offset = page * limit;
  const cacheKey = `stock_data_${empresaId}_${page}_${limit}`;
console.log('esta es la empresa id del stockguncion',empresaId)
  // Check cache first
  const cachedData = await cache.get(cacheKey);
  if (cachedData) return cachedData;

  // Parallel query execution
  const [
    listaProductos,
    totalProductos,
    proveedoresData,
    clientesData,
    topMasVendidos,
    topMenosVendidos,
    stockMovimiento,
    resultado
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
        localizacion: stockActual.localizacion,
        alertaStock: stockActual.alertaStock,
        ultimaActualizacion: productos.ultimaActualizacion,
      })
      .from(productos)
      .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId))
      .limit(limit)
      .offset(offset),

    db
      .select({
        count: sql<number>`COUNT(*)`.as("total"),
      })
      .from(productos)
      .where(eq(productos.empresaId, empresaId))
      .then(result => result.at(0)?.count ?? 0),

    db
      .select()
      .from(proveedores)
      .where(eq(proveedores.empresaId, empresaId)),

    db
      .select()
      .from(clientes)
      .where(eq(clientes.empresaId, empresaId)),

    db
      .select({
        producto: productos,
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as("totalVendido"),
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
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as("totalVendido"),
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
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as("totalVendido"),
        totalIngresos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientosStock.tipo} = 'ingreso' THEN ${movimientosStock.cantidad} ELSE 0 END), 0)`.as("totalIngresos"),
        totalEgresos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientosStock.tipo} = 'egreso' THEN ${movimientosStock.cantidad} ELSE 0 END), 0)`.as("totalEgresos"),
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
        ubicaciones: stockActual.localizacion,
        depositos: stockActual.deposito,
      })
      .from(productos)
      .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId))
  ]);

  const obtenerFiltros = {
    categorias: [...new Set(resultado.map(r => r.categorias))],
    ubicaciones: [...new Set(resultado.map(r => r.ubicaciones))],
    depositos: [...new Set(resultado.map(r => r.depositos))],
  };

  const finalResult = {
    obtenerFiltros,
    listaProductos,
    proveedoresData,
    clientesData,
    topMasVendidos,
    topMenosVendidos,
    stockMovimiento,
    totalProductos
  };

  // Cache the result for future requests
  await cache.set(cacheKey, finalResult, 75); // Cache for 5 minutes

  return finalResult;
};