import { useStore } from '@nanostores/react';
import React, { useEffect, useState } from 'react'
import { productosSeleccionadosVenta } from '../../../../../context/store';
import { formateoMoneda } from '../../../../../utils/formateoMoneda';

export default function DetalleMontoCompra() {
    const $productos = useStore(productosSeleccionadosVenta);
    const [totalVenta, setTotalVenta] = useState(0);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);

    const [subtotal, setSubtotal] = useState(0);
    const [ivaMonto, setIvaMonto] = useState(0);

    useEffect(() => {
        const sumaTotal = $productos.reduce(
            (acc, producto) => acc + producto.pVenta * producto.cantidad,
            0
        );

        const sumaSubtotal = $productos.reduce(
            (acc, producto) =>
                acc + (producto.pVenta * producto.cantidad) / (1 + producto.iva / 100),
            0
        );

        setTotalVenta(sumaTotal);
        setSubtotal(sumaSubtotal);
        setIvaMonto(sumaTotal - sumaSubtotal);

    }, [$productos]);

    return (

        <div className="mt-4 space-y-2">
            <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>  {formateoMoneda.format(subtotal)}</span>
            </div>
            <div className="flex justify-between">
                <span>IVA (21%):</span>
                <span>{formateoMoneda.format(ivaMonto)}</span>
            </div>
            <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span> {formateoMoneda.format(totalVenta)}</span>
            </div>
        </div>
    )
}
