import { useStore } from '@nanostores/react'
import React, { useMemo } from 'react'
import { stockStore } from '../../../../context/store';
import { formateoMoneda } from '../../../../utils/formateoMoneda';

export default function ReactData({ idData }) {
    const { data, loading } = useStore(stockStore);

    // Memoizamos los cálculos para evitar recálculos innecesarios
    const calculatedData = useMemo(() => {
        if (!data?.listaProductos) return null;

        const totalStockPrecio = data.listaProductos.reduce(
            (acc, producto) => acc + producto.pVenta * producto.stock,
            0
        );

        const totalStockCosto = data.listaProductos.reduce(
            (acc, producto) => acc + producto.pCompra * producto.stock,
            0
        );

        const productosStockBajos = data.listaProductos.filter(
            (prod) => prod.stock <= prod.alertaStock
        );

        const totalMasVendidos = data?.topMasVendidos?.reduce(
            (total, producto) => total + producto.totalVendido * producto.producto.pVenta,
            0
        ) || 0;

        return {
            totalProductos: data.listaProductos.length,
            stockBajos: productosStockBajos.length,
            totalVendidos: totalMasVendidos,
            valorStock: totalStockPrecio,
            costoStock: totalStockCosto
        };
    }, [data]);

    const obtenerData = (id) => {
        if (!calculatedData) return '0';

        switch (id) {
            case 1:
                return calculatedData.totalProductos;
            case 2:
                return calculatedData.stockBajos;
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
        return <div className="text-2xl font-semibold animate-pulse">...</div>;
    }

    return (
        <div className="text-2xl font-semibold">
            {obtenerData(idData)}
        </div>
    );
}