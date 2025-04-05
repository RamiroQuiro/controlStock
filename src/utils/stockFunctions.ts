import { and, asc, desc, eq, sql } from "drizzle-orm";
import db from "../db";
import { clientes, detalleVentas, movimientosStock, productos, proveedores, stockActual } from "../db/schema";

export const trayendoProductos = async (userId: string, page: number = 0, limit: number = 20) => {
  const offset = page * limit;

  // ✅ 1. Obtener lista de productos con información clave  
  const listaProductosQuery = db
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
    .where(eq(productos.userId, userId))
    .limit(limit)
    .offset(offset);

  // ✅ 2. Obtener total de productos en la base  
  const totalProductosQuery = db
    .select({
      count: sql<number>`COUNT(*)`.as("total"),
    })
    .from(productos)
    .where(eq(productos.userId, userId));

  // ✅ 3. Obtener filtros únicos en una sola consulta con `GROUP BY`  
  const filtrosQuery = db
    .select({
      categoria: productos.categoria,
      ubicacion: stockActual.localizacion,
      deposito: stockActual.deposito,
    })
    .from(productos)
    .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
    .where(eq(productos.userId, userId))
    .groupBy(productos.categoria, stockActual.localizacion, stockActual.deposito);

  // ✅ 4. Obtener proveedores y clientes en una sola consulta  
  const proveedoresYClientesQuery = Promise.all([
    db.select().from(proveedores).where(eq(proveedores.userId, userId)),
    db.select().from(clientes).where(eq(clientes.userId, userId)),
  ]);

  // ✅ 5. Obtener los productos más y menos vendidos  
  const ventasQuery = (order: "ASC" | "DESC") =>
    db
      .select({
        productoId: productos.id,
        descripcion: productos.descripcion,
        totalVendido: sql<number>`SUM(${detalleVentas.cantidad})`.as("totalVendido"),
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .where(eq(productos.userId, userId))
      .groupBy(productos.id)
      .orderBy(order === "DESC" ? desc(sql`totalVendido`) : asc(sql`totalVendido`))
      .limit(10);

  // ✅ 6. Obtener movimientos de stock  
  const stockMovimientoQuery = db
    .select({
      productoId: productos.id,
      descripcion: productos.descripcion,
      totalVendido: sql<number>`SUM(${detalleVentas.cantidad})`.as("totalVendido"),
      totalIngresos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientosStock.tipo} = 'ingreso' THEN ${movimientosStock.cantidad} ELSE 0 END), 0)`.as("totalIngresos"),
      totalEgresos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientosStock.tipo} = 'egreso' THEN ${movimientosStock.cantidad} ELSE 0 END), 0)`.as("totalEgresos"),
    })
    .from(productos)
    .leftJoin(detalleVentas, eq(detalleVentas.productoId, productos.id))
    .leftJoin(movimientosStock, eq(movimientosStock.productoId, productos.id))
    .where(eq(productos.userId, userId))
    .groupBy(productos.id)
    .limit(10);

  // ✅ 7. Ejecutar todas las consultas en paralelo  
  const [
    listaProductos,
    totalProductos,
    filtrosData,
    [proveedoresData, clientesData],
    topMasVendidos,
    topMenosVendidos,
    stockMovimiento,
  ] = await Promise.all([
    listaProductosQuery,
    totalProductosQuery.then((res) => res.at(0)?.count ?? 0),
    filtrosQuery,
    proveedoresYClientesQuery,
    ventasQuery("DESC"),
    ventasQuery("ASC"),
    stockMovimientoQuery,
  ]);

  // ✅ 8. Crear filtros únicos sin repetir valores  
  const obtenerFiltros = {
    categorias: [...new Set(filtrosData.map((r) => r.categoria))],
    ubicaciones: [...new Set(filtrosData.map((r) => r.ubicacion))],
    depositos: [...new Set(filtrosData.map((r) => r.deposito))],
  };

  return {
    obtenerFiltros,
    listaProductos,
    proveedoresData,
    clientesData,
    topMasVendidos,
    topMenosVendidos,
    stockMovimiento,
    totalProductos,
  };
};
