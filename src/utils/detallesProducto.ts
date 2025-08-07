import type { Producto } from "../types";
import { formateoMoneda } from "./formateoMoneda";

function calcularStockInicial(stockMovimientos) {
  return (
    stockMovimientos?.find((mov) => mov.motivo === "StockInicial")?.cantidad ??
    0
  );
}

function obtenerMovimientosOrdenados(stockMovimientos) {
  return [...(stockMovimientos || [])].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );
}

const calcularMargenGanancia = (productData:Producto) => {
  console.log('producto data de detalleProducto',productData)
  const pCompra=productData?.pCompra || 0;
  const pVenta=productData?.pVenta || 0;
  const impuesto=productData?.impuesto || "no aplica";

  const ivaDecimal = impuesto === "no aplica" ? 0 : parseFloat(impuesto) / 100;
  const costoConIVA = pCompra * (1 + ivaDecimal);
  return ((pVenta - costoConIVA) / costoConIVA) * 100;
};

const obtenerUltimaReposicion = (stockMovimiento) =>
  stockMovimiento.filter((mov) => mov?.tipo === "ingreso")[0]?.fecha || null;

const obtenerIvaMonto = (productData: Producto) => {
  // Obtener impuesto del producto -> "21%" | "10.5%" | "27%" | "No aplica"
  const iva = productData?.impuesto?.replace("%", "") || "0"; // Eliminar el "%" y evitar errores
  const precio = productData?.pVenta || 0;

  // Si el impuesto es "No aplica", devolver 0
  const ivaDecimal = iva === 'no aplica' ? 0 : parseFloat(iva) / 100;
  const returnData = formateoMoneda.format(precio * ivaDecimal);
  return returnData;
};

const calcularPrecioStock = (productData:Producto) => productData?.pVenta * productData?.stock;
export {
  obtenerIvaMonto,
  obtenerUltimaReposicion,
  calcularPrecioStock,
  calcularStockInicial,
  obtenerMovimientosOrdenados,
  calcularMargenGanancia,
};
