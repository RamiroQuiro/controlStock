import { and, asc, desc, eq, sql } from "drizzle-orm";
import db from "../db";
import { clientes, detalleVentas, movimientosStock, productos, proveedores, stockActual } from "../db/schema";

<<<<<<< HEAD
export const trayendoProductos = async (userId: string, page:number=0,limit:number=20) => {
  const offset = page * limit;

=======
export const trayendoProductos = async (userId: string) => {
>>>>>>> c9dce22c1ec836786b690d1ccff21e7f2e489546
    const dataDB = await db.transaction(async (trx) => {
      const listaProductos = await trx
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
<<<<<<< HEAD
        .where(eq(productos.userId, userId))
        .limit(limit) // 🔥 Establece el límite de productos a traer
        .offset(offset); // 🔥 Define desde dónde empezar
  
        const totalProductos = (await trx
        .select({
            count: sql<number>`COUNT(*)`.as("total"),
        })
        .from(productos)
        .where(eq(productos.userId, userId))).at(0)?.count ?? 0

=======
        .where(eq(productos.userId, userId));
  
>>>>>>> c9dce22c1ec836786b690d1ccff21e7f2e489546
      const proveedoresData = await trx
        .select()
        .from(proveedores)
        .where(eq(proveedores.userId, userId));
        
   
      const clientesData = await trx
        .select()
        .from(clientes)
        .where(eq(clientes.userId, userId));
      const topMasVendidos = await trx
        .select({
          producto: productos,
          totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as(
            "totalVendido"
          ),
        })
        .from(detalleVentas)
        .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
        .where(eq(productos.userId, userId))
        .groupBy(productos.id)
        .orderBy(desc(sql`totalVendido`))
        .limit(10);
  
      const topMenosVendidos = await trx
        .select({
          producto: productos,
          totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as(
            "totalVendido"
          ),
        })
        .from(detalleVentas)
        .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
        .where(eq(productos.userId, userId))
        .groupBy(productos.id)
        .orderBy(asc(sql`totalVendido`))
        .limit(10);
  
      const stockMovimiento = await trx
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
        .leftJoin(detalleVentas, eq(detalleVentas.productoId, productos.id)) // Ventas
        .leftJoin(movimientosStock, eq(movimientosStock.productoId, productos.id)) // Movimientos de stock
        .where(eq(productos.userId, userId))
        .groupBy(productos.id)
        .orderBy(asc(sql`totalVendido`))
        .limit(10);
  
      return {
        listaProductos,
        proveedoresData,
        clientesData,
        topMasVendidos,
        topMenosVendidos,
        stockMovimiento,
<<<<<<< HEAD
        totalProductos
=======
>>>>>>> c9dce22c1ec836786b690d1ccff21e7f2e489546
      };
    });
    return dataDB;
  };