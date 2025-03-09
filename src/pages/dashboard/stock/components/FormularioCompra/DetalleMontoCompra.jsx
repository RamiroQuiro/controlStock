import { useStore } from '@nanostores/react';
import React, { useEffect, useState } from 'react'
import { productosSeleccionadosVenta } from '../../../../../context/store';
import { formateoMoneda } from '../../../../../utils/formateoMoneda';

export default function DetalleMontoCompra({subtotal, ivaMonto, totalVenta}) {
    ;

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
