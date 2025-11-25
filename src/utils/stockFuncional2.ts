import { and, asc, desc, eq, sql, count } from "drizzle-orm";
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
    topMasVendidos,
    topMenosVendidos,
    topMenosEgresos,
    proveedoresData,
    clientesData,
    categoriasData,
    ubicacionesData,
    depositosData,
    totalProductosData,
    stockBajosData,
    valorCostoData,
    totalVendidosData,
    agotadosData,
    topHuesosData, // 🆕 Agregado a la desestructuración
  ] = await Promise.all([
    // 3. Top 10 más vendidos
    db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        descripcion: productos.descripcion,
        totalVendido: sql<number>`sum(${detalleVentas.cantidad})`.as(
          "totalVendido"
        ),
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
        totalVendido:
          sql<number>`coalesce(sum(${detalleVentas.cantidad}), 0)`.as(
            "totalVendido"
          ),
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
        totalEgresos: sql<number>`count(${movimientosStock.id})`.as(
          "totalEgresos"
        ),
      })
      .from(productos)
      .leftJoin(
        movimientosStock,
        and(
          eq(movimientosStock.productoId, productos.id),
          eq(movimientosStock.tipo, "egreso")
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

    // 7. Estadísticas Agregadas (NUEVO)
    // Total Productos
    db
      .select({ count: count() })
      .from(productos)
      .where(
        and(eq(productos.empresaId, empresaId), eq(productos.activo, true))
      ),

    // Stock Bajos
    db
      .select({ count: count() })
      .from(productos)
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(
        and(
          eq(productos.empresaId, empresaId),
          eq(productos.activo, true),
          sql`${stockActual.cantidad} <= ${stockActual.alertaStock}`
        )
      ),

    // Valor y Costo del Inventario
    db
      .select({
        valorStock: sql<number>`sum(${productos.pVenta} * ${stockActual.cantidad})`,
        costoStock: sql<number>`sum(${productos.pCompra} * ${stockActual.cantidad})`,
      })
      .from(productos)
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(
        and(eq(productos.empresaId, empresaId), eq(productos.activo, true))
      ),

    // Total Vendidos Global
    db
      .select({ total: sql<number>`sum(${detalleVentas.cantidad})` })
      .from(detalleVentas)
      .innerJoin(productos, eq(detalleVentas.productoId, productos.id))
      .where(eq(productos.empresaId, empresaId)),

    // Agotados (Stock == 0)
    db
      .select({ count: count() })
      .from(productos)
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(
        and(
          eq(productos.empresaId, empresaId),
          eq(productos.activo, true),
          eq(stockActual.cantidad, 0)
        )
      ),
    // 8. Top Huesos (Sin ventas en 180 días o nunca)
    db
      .select({
        id: productos.id,
        nombre: productos.nombre,
        descripcion: productos.descripcion,
        ultimaVenta: sql<number>`max(${detalleVentas.created_at})`.as(
          "ultimaVenta"
        ),
        stock: stockActual.cantidad,
      })
      .from(productos)
      .leftJoin(detalleVentas, eq(detalleVentas.productoId, productos.id))
      .leftJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(
        and(
          eq(productos.empresaId, empresaId),
          eq(productos.activo, true),
          sql`${stockActual.cantidad} > 0`
        )
      )
      .groupBy(productos.id, productos.nombre)
      // Filtramos en el HAVING comparando timestamps (segundos)
      .having(
        sql`max(${detalleVentas.created_at}) IS NULL OR max(${detalleVentas.created_at}) < strftime('%s', 'now', '-180 days')`
      )
      .limit(5),
  ]);

  // Estructuramos el resultado final en un objeto claro y fácil de usar.
  const resultadoFinal = {
    // Estadísticas
    stats: {
      topMasVendidos,
      topMenosVendidos,
      topMenosEgresos,
      topHuesos: topHuesosData, // ✅ Asignación correcta
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
    // 🆕 Datos Agregados para Cards
    datosAdicionales: {
      totalProductos: totalProductosData[0]?.count || 0,
      stockBajos: stockBajosData[0]?.count || 0,
      valorStock: valorCostoData[0]?.valorStock || 0,
      costoStock: valorCostoData[0]?.costoStock || 0,
      totalVendidos: totalVendidosData[0]?.total || 0,
      agotados: agotadosData[0]?.count || 0,
    },
  };

  return resultadoFinal;
};
