// utils/calculosEstadisticas.ts

interface Compra {
  id: string;
  fecha: Date;
  total: number;
  estado: string;
  tiempoEntrega?: number;
  descuento?: number;
  formaPago: string;
  productos: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

interface EstadisticasProveedor {
  totalGastado: number;
  promedioCompra: number;
  cantidadCompras: number;
  frecuenciaCompra: number;
  ultimaCompra: string;
  comprasMesActual: number;
  gastoMesActual: number;
  productosMasComprados: Array<{
    nombre: string;
    cantidad: number;
    total: number;
  }>;
  cumplimientoEntrega: number;
  tiempoPromedioEntrega: number;
  descuentosObtenidos: number;
  deudaPendiente: number;
  limiteCredito: number;
  diasCreditoPromedio: number;
}

export const calcularEstadisticasProveedor = (
  compras: Compra[],
  limiteCredito = 0
): EstadisticasProveedor => {
  const ahora = new Date();
  const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  // Compras del mes actual
  const comprasMesActual = compras.filter(
    (compra) => new Date(compra.fecha) >= inicioMesActual
  );

  // Calcular productos más comprados
  const productosAgrupados = compras.reduce((acc, compra) => {
    compra.productos.forEach((producto) => {
      if (!acc[producto.id]) {
        acc[producto.id] = {
          nombre: producto.nombre,
          cantidad: 0,
          total: 0,
        };
      }
      acc[producto.id].cantidad += producto.cantidad;
      acc[producto.id].total += producto.cantidad * producto.precio;
    });
    return acc;
  }, {} as Record<string, { nombre: string; cantidad: number; total: number }>);

  // Ordenar productos por total
  const productosMasComprados = Object.values(productosAgrupados)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Calcular frecuencia de compra
  let frecuenciaCompra = 0;
  if (compras.length > 1) {
    const primerCompra = new Date(compras[compras.length - 1].fecha);
    const ultimaCompra = new Date(compras[0].fecha);
    const diasTotales = Math.floor(
      (ultimaCompra.getTime() - primerCompra.getTime()) / (1000 * 60 * 60 * 24)
    );
    frecuenciaCompra = Math.round(diasTotales / (compras.length - 1));
  }

  // Calcular cumplimiento de entrega y tiempo promedio
  const entregasATiempo = compras.filter(
    (compra) => compra.tiempoEntrega && compra.tiempoEntrega <= 5 // Asumiendo 5 días como estándar
  ).length;
  const cumplimientoEntrega = compras.length > 0
    ? Math.round((entregasATiempo / compras.length) * 100)
    : 0;

  const tiempoPromedioEntrega = compras.length > 0
    ? Math.round(
        compras.reduce((acc, compra) => acc + (compra.tiempoEntrega || 0), 0) /
        compras.length
      )
    : 0;

  // Calcular deuda pendiente (compras a crédito no pagadas)
  const deudaPendiente = compras
    .filter((compra) => compra.formaPago === 'credito' && compra.estado !== 'pagado')
    .reduce((acc, compra) => acc + compra.total, 0);

  // Calcular días de crédito promedio
  const comprasCredito = compras.filter(
    (compra) => compra.formaPago === 'credito'
  );
  const diasCreditoPromedio = comprasCredito.length > 0
    ? Math.round(
        comprasCredito.reduce((acc, compra) => acc + 30, 0) / // Asumiendo 30 días por defecto
        comprasCredito.length
      )
    : 0;

  return {
    totalGastado: compras.reduce((acc, compra) => acc + compra.total, 0),
    promedioCompra:
      compras.length > 0
        ? compras.reduce((acc, compra) => acc + compra.total, 0) / compras.length
        : 0,
    cantidadCompras: compras.length,
    frecuenciaCompra,
    ultimaCompra: compras[0]?.fecha.toISOString() || new Date().toISOString(),
    comprasMesActual: comprasMesActual.length,
    gastoMesActual: comprasMesActual.reduce(
      (acc, compra) => acc + compra.total,
      0
    ),
    productosMasComprados,
    cumplimientoEntrega,
    tiempoPromedioEntrega,
    descuentosObtenidos: compras.reduce(
      (acc, compra) => acc + (compra.descuento || 0),
      0
    ),
    deudaPendiente,
    limiteCredito,
    diasCreditoPromedio,
  };
};

// Función auxiliar para calcular estadísticas mensuales
export const calcularEstadisticasMensuales = (compras: Compra[]) => {
  const estadisticasPorMes = compras.reduce((acc, compra) => {
    const fecha = new Date(compra.fecha);
    const mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    if (!acc[mes]) {
      acc[mes] = {
        total: 0,
        cantidad: 0,
        promedio: 0,
      };
    }

    acc[mes].total += compra.total;
    acc[mes].cantidad += 1;
    acc[mes].promedio = acc[mes].total / acc[mes].cantidad;

    return acc;
  }, {} as Record<string, { total: number; cantidad: number; promedio: number }>);

  return Object.entries(estadisticasPorMes)
    .map(([mes, stats]) => ({
      mes,
      ...stats,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
};

// Función para calcular tendencias
export const calcularTendencias = (
  estadisticasActuales: EstadisticasProveedor,
  estadisticasAnteriores: EstadisticasProveedor
) => {
  return {
    gastoMensual: {
      variacion:
        ((estadisticasActuales.gastoMesActual -
          estadisticasAnteriores.gastoMesActual) /
          estadisticasAnteriores.gastoMesActual) *
        100,
      tendencia:
        estadisticasActuales.gastoMesActual >
        estadisticasAnteriores.gastoMesActual
          ? "aumento"
          : "disminución",
    },
    cumplimientoEntrega: {
      variacion:
        estadisticasActuales.cumplimientoEntrega -
        estadisticasAnteriores.cumplimientoEntrega,
      tendencia:
        estadisticasActuales.cumplimientoEntrega >
        estadisticasAnteriores.cumplimientoEntrega
          ? "mejora"
          : "deterioro",
    },
    tiempoEntrega: {
      variacion:
        estadisticasActuales.tiempoPromedioEntrega -
        estadisticasAnteriores.tiempoPromedioEntrega,
      tendencia:
        estadisticasActuales.tiempoPromedioEntrega <
        estadisticasAnteriores.tiempoPromedioEntrega
          ? "mejora"
          : "deterioro",
    },
  };
};