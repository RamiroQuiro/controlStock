import { and, count, eq, gte, lte, sql, sum } from 'drizzle-orm';
import db from '../db';
import {
  categorias,
  clientes,
  comprasProveedores,
  detalleVentas,
  productos,
  proveedores,
  ventas,
  productoCategorias,
} from '../db/schema';

const stadisticasDash = async (userId: string, empresaId: string) => {
  try {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
    const añoActual = fechaActual.getFullYear();
    const añoAnterior = mesActual === 1 ? añoActual - 1 : añoActual;

    const inicioMesActual = new Date(añoActual, mesActual - 1, 1);
    const finMesActual = new Date(añoActual, mesActual, 0, 23, 59, 59);
    const inicioMesAnterior = new Date(añoAnterior, mesAnterior - 1, 1);
    const finMesAnterior = new Date(añoAnterior, mesAnterior, 0, 23, 59, 59);

    // 1. Ventas del mes
    const [ventasMes] = await db
      .select({ nVentasMes: count(), totalVentasMes: sum(ventas.total) })
      .from(ventas)
      .where(
        and(
          eq(ventas.empresaId, empresaId),
          gte(ventas.fecha, inicioMesActual),
          lte(ventas.fecha, finMesActual)
        )
      );

    // 2. Clientes nuevos
    const [clientesNuevosMes] = await db
      .select({ nClientesNuevos: count() })
      .from(clientes)
      .where(
        and(
          eq(clientes.empresaId, empresaId),
          sql`strftime('%m', datetime(${clientes.fechaAlta}, 'unixepoch')) = ${mesActual.toString().padStart(2, '0')}`
        )
      );

    // 3. Productos bajo stock
    const [productosBajoStock] = await db
      .select({ cantidadBajoStock: count() })
      .from(productos)
      .where(
        and(
          eq(productos.empresaId, empresaId),
          eq(productos.activo, true),
          lte(productos.stock, productos.alertaStock)
        )
      );

    // 4. Últimas ventas
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

    // 5. Últimas compras
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

    // 6. Ventas por categoría (mes actual)
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
          gte(ventas.fecha, inicioMesActual),
          lte(ventas.fecha, finMesActual)
        )
      )
      .groupBy(categorias.nombre);
    const test = await db
      .select()
      .from(detalleVentas)
      .innerJoin(ventas, eq(ventas.id, detalleVentas.ventaId))
      .innerJoin(productos, eq(productos.id, detalleVentas.productoId))
      .innerJoin(
        productoCategorias,
        eq(productoCategorias.productoId, productos.id)
      )
      .innerJoin(categorias, eq(categorias.id, productoCategorias.categoriaId))
      .where(eq(productos.empresaId, empresaId));
    console.log(test);

    // 7. Ventas por categoría (mes anterior)
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
          gte(ventas.fecha, inicioMesAnterior),
          lte(ventas.fecha, finMesAnterior)
        )
      )
      .groupBy(categorias.nombre);

    // Mezclar ventas y compras
    const ultimasTransacciones = [...ultimasVentas, ...ultimasCompras].map(
      (trans) => ({
        ...trans,
        tipo: trans.cliente ? 'venta' : 'compra',
      })
    );

    // Rendimiento de categorías
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
        diferencia > 0 ? 'subida' : diferencia < 0 ? 'bajada' : 'estable';

      return {
        nombre: actual.categoria,
        porcentaje,
        totalVentas: actual.totalVentas,
        tendencia,
        color: `text-primary-${((porcentaje % 5) + 1) * 100}`,
      };
    });

    const rendimientoPromedio = rendimientoCategorias.length
      ? Math.round(
          rendimientoCategorias.reduce((acc, cat) => acc + cat.porcentaje, 0) /
            rendimientoCategorias.length
        )
      : 0;

    const ticketPromedioMes =
      ventasMes.nVentasMes > 0
        ? parseFloat(ventasMes.totalVentasMes) / ventasMes.nVentasMes
        : 0;

    return {
      dataDb: {
        nVentasDelMes: ventasMes.nVentasMes,
        totalVentasMes: ventasMes.totalVentasMes,
        ticketPromedioMes,
        categorias: rendimientoCategorias,
        rendimientoPromedio,
        productosBajoStock,
        clientesNuevosMes,
        ultimasTransacciones,
      },
    };
  } catch (error) {
    console.error('Error en stadisticasDash:', error);
    return { dataDb: null };
  }
};

export { stadisticasDash };
