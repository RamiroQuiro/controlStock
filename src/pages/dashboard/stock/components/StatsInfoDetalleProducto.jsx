import { DollarSign, LucideLineChart, SendToBack } from 'lucide-react'
import React from 'react'
import { formateoMoneda } from '../../../../utils/formateoMoneda'
import DivReact from '../../../../components/atomos/DivReact'

export default function StatsInfoDetalleProducto({infoProducto,totalStockProducto,margenGanancia}) {
  return (
    <DivReact>
    <div className="w-full flex items-center justify-around">
      <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
        <div className="flex items-center gap-1">
          <DollarSign className="stroke-primary-100" />
          <p className="text-primary-textoTitle">Precio de Costo</p>
        </div>
        <p className=" font-bold text-2xl trakin text-primary-textoTitle">
          {formateoMoneda.format(infoProducto.productData?.pCompra)}
        </p>
      </div>
      <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
        <div className="flex items-center gap-1">
          <DollarSign className="stroke-primary-100" />
          <p className="text-primary-textoTitle">Precio de Venta</p>
        </div>
        <p className=" font-bold text-2xl trakin text-primary-textoTitle">
          {formateoMoneda.format(infoProducto.productData?.pVenta)}
        </p>
      </div>
      <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
        <div className="flex items-center gap-1">
          <SendToBack className="stroke-primary-100" />
          <p className="text-primary-textoTitle">Precio Stock</p>
        </div>
        <p className=" font-bold text-2xl trakin text-primary-textoTitle">
          {formateoMoneda.format(totalStockProducto)}
        </p>
      </div>
      <div className="bg-primary-bg-componentes p1 rounded-lg  flex flex-col items-center justify-normal">
        <div className="flex items-center gap-1">
          <LucideLineChart className="stroke-primary-100" />
          <p className="text-primary-textoTitle">Margen Ganancia</p>
        </div>
        <p className=" font-bold text-2xl trakin text-primary-textoTitle">
          %{margenGanancia.toFixed(2)}
        </p>
      </div>
    </div>
  </DivReact>
  )
}
