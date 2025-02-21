function calcularStockInicial(stockMovimientos) {
  return stockMovimientos?.find((mov) => mov.motivo === "StockInicial")?.cantidad ?? 0;
}

function obtenerMovimientosOrdenados(stockMovimientos) {
  return [...(stockMovimientos || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

function calcularMargenGanancia(pVenta, pCompra) {
  return ((pVenta - pCompra) / pCompra) * 100;
}

const obtenerUltimaReposicion=(stockMovimiento)=>stockMovimiento.filter((mov) => mov.tipo === "ingreso")[0]
?.fecha || null;


const calcularPrecioStock=(productData)=>productData?.pVenta * productData?.stock;
export {
  obtenerUltimaReposicion,
  calcularPrecioStock,
  calcularStockInicial,
  obtenerMovimientosOrdenados,
  calcularMargenGanancia,
};