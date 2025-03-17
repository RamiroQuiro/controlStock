import React from 'react'
import Table from '../../../../../components/tablaComponentes/Table'
import { columnasVentasTodas  } from '../../../../../utils/columnasTables'
import formatDate from '../../../../../utils/formatDate'
import { ArrowBigUpDash, MoveRight, Printer, SearchCheck } from 'lucide-react'
import { formateoMoneda } from '../../../../../utils/formateoMoneda'

export default function ConfeccionTabla({data}) {

const newArray=data?.map((venta,i)=>{
const fecha=formatDate(venta.fecha)

console.log(venta)
    return {
        'N°':i+1,
        nComprobante:venta.nComprobante,
        cliente:venta.clienteId,
        dniCliente:venta.clienteId,
        metodoPago:venta.metodoPago,
        fechaVenta:fecha,
        total:formateoMoneda.format(venta.total),
        acciones:<div className='flex items-center justify-center gap-2 w-full'>
                <button id="impresionVenta" className='bg-primary-bg-componentes relative rounded-full group py-0.5 px-1'> <span className='absolute left-1/2 -translate-x-1/2 bottom-[103%] bg-primary-textoTitle/90 px-1 py-0.5 w-16 text-xs text-white hidden group-hover:flex items-center justify-center animate-aparecer'>Imprimir</span><Printer className='w-5 stroke-slate-500'/></button>
                <button id="verVenta" onClick={()=>window.location.href=`/dashboard/ventas/${venta.id}`} className='bg-primary-bg-componentes relative rounded-full group py-0.5 px-1'> <span className='absolute left-1/2 -translate-x-1/2 bottom-[103%] bg-primary-textoTitle/90 px-1 py-0.5 w-16 text-xs text-white hidden group-hover:flex items-center  justify-center animate-aparecer'>ver venta</span><SearchCheck className='stroke-green-500 w-5 '/></button>
        </div>
    }

})

  return (
    <Table columnas={columnasVentasTodas} arrayBody={newArray}/>
  )
}
