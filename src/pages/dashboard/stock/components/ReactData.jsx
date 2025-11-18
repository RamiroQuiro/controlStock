import { useStore } from '@nanostores/react';
import React, { useMemo } from 'react';
import { stockStore } from '../../../../context/stock.store';
import { formateoMoneda } from '../../../../utils/formateoMoneda';

export default function ReactData({ idData }) {
  const { productos, loading, totalProductos } = useStore(stockStore);
  
  // Memoizamos los cálculos para evitar recálculos innecesarios
  const calculatedData = useMemo(() => {
    if (!productos || productos.length === 0) {
      return {
        totalProductos: 0,
        stockBajos: 0,
        totalVendidos: 0,
        valorStock: 0,
        costoStock: 0,
      };
    }

    try {
      const totalStockPrecio = productos.reduce(
        (acc, producto) => acc + (producto.pVenta || 0) * (producto.stock || 0),
        0
      );

      const totalStockCosto = productos.reduce(
        (acc, producto) => acc + (producto.pCompra || 0) * (producto.stock || 0),
        0
      );

      const productosStockBajos = productos.filter(
        (prod) => (prod.stock || 0) <= (prod.alertaStock || 0)
      );

      const totalMasVendidos = productos.reduce(
        (total, producto) => total + ((producto.totalVendido || 0) * (producto.pVenta || 0)),
        0
      );

      return {
        totalProductos: totalProductos || productos.length,
        stockBajos: productosStockBajos.length,
        totalVendidos: totalMasVendidos,
        valorStock: totalStockPrecio,
        costoStock: totalStockCosto,
      };
    } catch (error) {
      console.error('Error calculando datos:', error);
      return {
        totalProductos: 0,
        stockBajos: 0,
        totalVendidos: 0,
        valorStock: 0,
        costoStock: 0,
      };
    }
  }, [productos, totalProductos]);

  const obtenerData = (id) => {
    if (!calculatedData) return '0';

    switch (id) {
      case 1:
        return calculatedData.totalProductos.toString();
      case 2:
        return calculatedData.stockBajos.toString();
      case 3:
        return formateoMoneda.format(calculatedData.totalVendidos);
      case 4:
        return formateoMoneda.format(calculatedData.valorStock);
      case 5:
        return formateoMoneda.format(calculatedData.costoStock);
      default:
        return '0';
    }
  };

  if (loading) {
    return (
      <div className="text-lg md:text-2xl font-semibold animate-pulse bg-white/20 rounded w-16 h-6 md:w-20 md:h-8"></div>
    );
  }

  return (
    <div className="text-lg md:text-2xl font-semibold">
      {obtenerData(idData)}
    </div>
  );
}