
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

/**
 * Obtiene un conjunto completo de datos de stock, productos y estadísticas relacionadas.
 * 
 * @param empresaId - El ID de la empresa para la que se obtienen los datos.
 * @param page - El número de página para la paginación de productos (comienza en 0).
 * @param limit - El número de productos a devolver por página.
 * @returns Un objeto con toda la información de stock y estadísticas.
 */
export const obtenerDatosStock = async (
  empresaId: string,
  page: number = 0,
  limit: number = 20
) => {
  const offset = page * limit;


  // Ejecutamos todas las consultas en paralelo para máxima eficiencia.
  const [
    listaProductos,
    totalProductos,
    topMasVendidos,
    topMenosVendidos,
    topMenosEgresos,
    proveedoresData,
    clientesData,
    categoriasData,
    ubicacionesData,
    depositosData,
  ] = await Promise.all([
    // 1. Consulta principal de productos (paginada y corregida)
    db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        codigoBarra: productos.codigoBarra,
        descripcion: productos.descripcion,
        pCompra: productos.pCompra,
        pVenta: productos.pVenta,
        stock: productos.stock,
        srcPhoto: productos.srcPhoto,
        // CORREGIDO: Se obtiene el nombre de la ubicación a través del JOIN
        
        alertaStock: stockActual.alertaStock,
        ultimaActualizacion: productos.ultimaActualizacion,
        totalVentas: sql<number>`cast(coalesce(sum(${detalleVentas.cantidad}), 0) as int)`.as("totalVentas"),
      })
      .from(productos)
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      // CORREGIDO: Hacemos LEFT JOIN para no excluir productos sin ubicación definida
      .leftJoin(ubicaciones, eq(stockActual.ubicacionesId, ubicaciones.id))
      .leftJoin(detalleVentas, eq(detalleVentas.productoId, productos.id))
      .where(and(eq(productos.empresaId, empresaId), eq(productos.activo, true)))
      // CORREGIDO: Agrupamos por todas las columnas no agregadas
      .groupBy(
        productos.id,
        productos.nombre,
        productos.codigoBarra,
        productos.descripcion,
        productos.pCompra,
        productos.pVenta,
        productos.stock,
        productos.srcPhoto,
        ubicaciones.nombre,
        stockActual.alertaStock,
        productos.ultimaActualizacion
      )
      .orderBy(desc(sql`totalVentas`))
      .limit(limit)
      .offset(offset),

    // 2. Conteo total de productos
    db
      .select({ count: sql<number>`count(*)` })
      .from(productos)
      .where(eq(productos.empresaId, empresaId))
      .then((res) => res[0]?.count ?? 0),

    // 3. Top 10 más vendidos
    db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        descripcion: productos.descripcion, 
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as("totalVendido"),
      })
      .from(detalleVentas)
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId))
      .groupBy(productos.id, productos.nombre)
      .orderBy(desc(sql`totalVendido`))
      .limit(10),

    // 4. Top 10 menos vendidos (incluye los que no tienen ventas)
    db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        descripcion: productos.descripcion, 
        totalVendido: sql<number>`coalesce(sum(${detalleVentas.cantidad}), 0)`.as("totalVendido"),
      })
      .from(productos)
      .leftJoin(detalleVentas, eq(detalleVentas.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId))
      .groupBy(productos.id, productos.nombre)
      .orderBy(asc(sql`totalVendido`))
      .limit(10),

    // 5. Top 10 con menos movimientos de egreso
    db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        descripcion: productos.descripcion, 
        totalEgresos: sql<number>`count(${movimientosStock.id})`.as("totalEgresos"),
      })
      .from(productos)
      .leftJoin(movimientosStock, 
        and(
          eq(movimientosStock.productoId, productos.id),
          eq(movimientosStock.tipo, 'egreso')
        )
      )
      .where(eq(productos.empresaId, empresaId))
      .groupBy(productos.id, productos.nombre)
      .orderBy(asc(sql`totalEgresos`))
      .limit(10),

    // 6. Datos de soporte para estadísticas y filtros
    db.select().from(proveedores).where(eq(proveedores.empresaId, empresaId)),
    db.select().from(clientes).where(eq(clientes.empresaId, empresaId)),
    db.select().from(categorias).where(eq(categorias.empresaId, empresaId)),
    db.select().from(ubicaciones).where(eq(ubicaciones.empresaId, empresaId)),
    db.select().from(depositos).where(eq(depositos.empresaId, empresaId)),
  ]);

  // Estructuramos el resultado final en un objeto claro y fácil de usar.
  const resultadoFinal = {
    // Datos paginados
    productos: listaProductos,
    totalProductos: totalProductos,
    // Estadísticas
    stats: {
      topMasVendidos,
      topMenosVendidos,
      topMenosEgresos,
    },
    // Datos para filtros y otras secciones
    filtros: {
      categorias: categoriasData,
      ubicaciones: ubicacionesData,
      depositos: depositosData,
    },
    // Datos adicionales
    proveedores: proveedoresData,
    clientes: clientesData,
  };

  return resultadoFinal;
};
