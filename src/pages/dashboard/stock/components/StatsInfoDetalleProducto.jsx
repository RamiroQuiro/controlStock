import { DollarSign, LucideLineChart, SendToBack } from 'lucide-react'
import React, { use, useMemo } from 'react'
import { formateoMoneda } from '../../../../utils/formateoMoneda'
import InputFormularioSolicitud from '../../../../components/moleculas/InputFormularioSolicitud'
import { calcularMargenGanancia, calcularPrecioStock, obtenerIvaMonto } from '../../../../utils/detallesProducto'
import DivReact from '../../../../components/atomos/DivReact'

export default function StatsInfoDetalleProducto({handleChangeForm,disableEdit,formulario,data:infoProducto,loading}) {



  const calculos = useMemo(() => {
    return {
      totalStockProducto :calcularPrecioStock(infoProducto),
      margenGanancia : calcularMargenGanancia(infoProducto)
    }
    
  }, [loading]);
  return (
    <DivReact>
    {loading ? (
      <div className="w-full flex flex-col md:flex-row items-center justify-around gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg w-[18%] h-[100px] flex flex-col items-center justify-center gap-2 p-2" />
        ))}
      </div>
    ) : (
      <div className="w-full flex flex-wrap gap-2 items-center justify-around">
        <div className="bg-primary-bg-componentes p-1 border md:border-0 rounded-lg flex flex-col items-center justify-normal">
          <div className="flex items-center gap-1">
            <DollarSign className="stroke-primary-100" />
            <p className="text-primary-textoTitle">Precio de Costo</p>
          </div>
          {disableEdit ? (
            <p className="font-bold text-2xl trakin text-primary-textoTitle">
              {formateoMoneda.format(infoProducto?.productData?.pCompra)}
            </p>
          ) : (
            <div>
              <InputFormularioSolicitud
                name="pCompra"
                type="number"
                id="pCompra"
                onchange={handleChangeForm}
                value={formulario?.productData?.pCompra}
                className="w-1/2 text-xl text-primary-textoTitle"
                isMoney
              />
            </div>
          )}
        </div>
  
        <div className="bg-primary-bg-componentes p-1 border md:border-0 rounded-lg flex flex-col items-center justify-normal">
          <div className="flex items-center gap-1">
            <DollarSign className="stroke-primary-100" />
            <p className="text-primary-textoTitle">Monto Iva</p>
          </div>
          <p className="font-bold text-2xl trakin text-primary-textoTitle">
            {obtenerIvaMonto(infoProducto)}
          </p>
        </div>
  
        <div className="bg-primary-bg-componentes p-1 border md:border-0 rounded-lg flex flex-col items-center justify-normal">
          <div className="flex items-center gap-1">
            <DollarSign className="stroke-primary-100" />
            <p className="text-primary-textoTitle">Precio de Venta</p>
          </div>
          {disableEdit ? (
            <p className="font-bold text-2xl trakin text-primary-textoTitle">
              {formateoMoneda.format(infoProducto?.productData?.pVenta)}
            </p>
          ) : (
            <div>
              <InputFormularioSolicitud
                name="pVenta"
                type="number"
                id="pVenta"
                onchange={handleChangeForm}
                value={formulario?.productData?.pVenta}
                className="w-1/2 text-xl text-primary-textoTitle"
                isMoney
              />
            </div>
          )}
        </div>
  
        <div className="bg-primary-bg-componentes p-1 border md:border-0 rounded-lg flex flex-col items-center justify-normal">
          <div className="flex items-center gap-1">
            <SendToBack className="stroke-primary-100" />
            <p className="text-primary-textoTitle">Precio Stock</p>
          </div>
          <p className="font-bold text-2xl trakin text-primary-textoTitle">
            {formateoMoneda?.format(calculos.totalStockProducto)}
          </p>
        </div>
  
        <div className="bg-primary-bg-componentes p-1 border md:border-0 rounded-lg flex flex-col items-center justify-normal">
          <div className="flex items-center gap-1">
            <LucideLineChart className="stroke-primary-100" />
            <p className="text-primary-textoTitle">Margen Ganancia</p>
          </div>
          <p className="font-bold text-2xl trakin text-primary-textoTitle">
            %{calculos.margenGanancia?.toFixed(2)}
          </p>
        </div>
      </div>
    )}
  </DivReact>
  
  )
}