import { and, count, eq, gte, lte, sql, sum } from "drizzle-orm";
import db from "../db";
import {
  categorias,
  clientes,
  comprasProveedores,
  detalleVentas,
  productos,
  proveedores,
  ventas,
  productoCategorias,
  stockActual,
} from "../db/schema";
import {
  getInicioYFinDeMesActual,
  getInicioYFinDeMesAnterior,
} from "../utils/timeUtils";

const stadisticasDash = async (userId: string, empresaId: string) => {
  try {
    // 🔹 Rangos de fechas obtenidos desde timeUtils
    const { inicio: inicioMesActual, fin: finMesActual } =
      getInicioYFinDeMesActual();
    const { inicio: inicioMesAnterior, fin: finMesAnterior } =
      getInicioYFinDeMesAnterior();

    console.log(
      "inicio mes actual,",
      new Date(inicioMesActual * 1000),
      " fin del mes actual",
      new Date(finMesActual)
    );
    // 1️⃣ Ventas del mes actual
    const [ventasMes] = await db
      .select({ nVentasMes: count(), totalVentasMes: sum(ventas.total) })
      .from(ventas)
      .where(
        and(
          eq(ventas.empresaId, empresaId),
          gte(ventas.fecha, new Date(inicioMesActual * 1000)),
          lte(ventas.fecha, new Date(finMesActual * 1000))
        )
      );

    // 2️⃣ Clientes nuevos en el mes actual
    const [clientesNuevosMes] = await db
      .select({ nClientesNuevos: count() })
      .from(clientes)
      .where(
        and(
          eq(clientes.empresaId, empresaId),
          gte(clientes.fechaAlta, new Date(inicioMesActual * 1000)),
          lte(clientes.fechaAlta, new Date(finMesActual * 1000))
        )
      );

    // 3️⃣ Productos con stock por debajo del mínimo
    const [productosBajoStock] = await db
      .select({ cantidadBajoStock: count() })
      .from(productos)
      .innerJoin(stockActual, eq(stockActual.productoId, productos.id))
      .where(
        and(
          eq(productos.empresaId, empresaId),
          eq(productos.activo, true),
          lte(stockActual.cantidad, productos.alertaStock)
        )
      );

    // 4️⃣ Últimas ventas realizadas
    const ultimasVentas = await db
      .select({
        id: ventas.id,
        cliente: clientes.nombre,
        fecha: ventas.fecha,
        total: ventas.total,
        metodoPago: ventas.metodoPago,
      })
      .from(ventas)
      .innerJoin(clientes, eq(clientes.id, ventas.clienteId))
      .where(eq(ventas.empresaId, empresaId))
      .orderBy(sql`ventas.fecha DESC`)
      .limit(10);

    // 5️⃣ Últimas compras a proveedores
    const ultimasCompras = await db
      .select({
        id: comprasProveedores.id,
        proveedor: proveedores.nombre,
        fecha: comprasProveedores.fecha,
        total: comprasProveedores.total,
        metodoPago: comprasProveedores.metodoPago,
      })
      .from(comprasProveedores)
      .innerJoin(
        proveedores,
        eq(proveedores.id, comprasProveedores.proveedorId)
      )
      .where(eq(comprasProveedores.empresaId, empresaId))
      .orderBy(sql`comprasProveedores.fecha DESC`)
      .limit(10);

    // 6️⃣ Ventas por categoría en el mes actual
    const ventasPorCategoria = await db
      .select({
        categoria: categorias.nombre,
        totalVentas: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`,
        cantidadVentas: sql<number>`sum(${detalleVentas.cantidad})`,
      })
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .innerJoin(
        productoCategorias,
        eq(productoCategorias.productoId, productos.id)
      )
      .innerJoin(categorias, eq(categorias.id, productoCategorias.categoriaId))
      .where(
        and(
          eq(productos.empresaId, empresaId),
          gte(ventas.fecha, new Date(inicioMesActual * 1000)),
          lte(ventas.fecha, new Date(finMesActual * 1000))
        )
      )
      .groupBy(categorias.nombre);

    // 7️⃣ Ventas por categoría en el mes anterior
    const ventasAnteriores = await db
      .select({
        categoria: categorias.nombre,
        totalVentas: sql<number>`sum(${detalleVentas.cantidad} * ${detalleVentas.precio})`,
        cantidadVentas: sql<number>`sum(${detalleVentas.cantidad})`,
      })
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .innerJoin(
        productoCategorias,
        eq(productoCategorias.productoId, productos.id)
      )
      .innerJoin(categorias, eq(categorias.id, productoCategorias.categoriaId))
      .where(
        and(
          eq(productos.empresaId, empresaId),
          gte(ventas.fecha, new Date(inicioMesActual * 1000)),
          lte(ventas.fecha, new Date(finMesActual * 1000))
        )
      )
      .groupBy(categorias.nombre);

    // 8️⃣ Mezclar ventas y compras para mostrar últimas transacciones
    const ultimasTransacciones = [...ultimasVentas, ...ultimasCompras].map(
      (trans) => ({
        ...trans,
        tipo: trans.cliente ? "venta" : "compra",
      })
    );

    // 9️⃣ Cálculo del rendimiento por categoría
    const totalVentasMesActual = ventasPorCategoria.reduce(
      (acc, curr) => acc + curr.cantidadVentas,
      0
    );

    const rendimientoCategorias = ventasPorCategoria.map((actual) => {
      const anterior = ventasAnteriores.find(
        (a) => a.categoria === actual.categoria
      );
      const porcentaje = totalVentasMesActual
        ? Math.round((actual.cantidadVentas / totalVentasMesActual) * 100)
        : 0;

      const diferencia = anterior
        ? actual.totalVentas - anterior.totalVentas
        : 0;

      const tendencia =
        diferencia > 0 ? "subida" : diferencia < 0 ? "bajada" : "estable";

      return {
        nombre: actual.categoria,
        porcentaje,
        totalVentas: actual.totalVentas,
        tendencia,
        color: `text-primary-${((porcentaje % 5) + 1) * 100}`,
      };
    });

    // 🔟 Promedio general del rendimiento (por estética en UI)
    const rendimientoPromedio = rendimientoCategorias.length
      ? Math.round(
          rendimientoCategorias.reduce((acc, cat) => acc + cat.porcentaje, 0) /
            rendimientoCategorias.length
        )
      : 0;

    // 🔟 Ticket promedio
    const nVentas = ventasMes?.nVentasMes || 0;
    const totalVentas = ventasMes?.totalVentasMes || 0;
    const ticketPromedioMes = nVentas > 0 ? totalVentas / nVentas : 0;

    // ✅ Resultado final
    return {
      dataDb: {
        nVentasDelMes: nVentas,
        totalVentasMes: totalVentas,
        ticketPromedioMes,
        categorias: rendimientoCategorias,
        rendimientoPromedio,
        productosBajoStock,
        clientesNuevosMes,
        ultimasTransacciones,
      },
    };
  } catch (error) {
    console.error("Error en stadisticasDash:", error);
    return { dataDb: null };
  }
};

export { stadisticasDash };
