import React, { useEffect, useState } from 'react'
import VentaDetalle from '../VentaDetalle'
import type { ComprobanteDetalle } from '../../../../../types'


interface Props{
    ventaId:string
}


export default function ContenedorVisorDetalleVenta({ventaId}:Props) {
    const [venta, setVenta] = useState<ComprobanteDetalle>({})
useEffect(() => {
  const peticionVenta=async()=>{
    try {
        const response=await fetch(`/api/sales/${ventaId}`,{
            method:'GET',
            headers:{
                'x-user-id':'1'
            }
        })
        const data=await response.json()
        console.log('data en el contenedorVisorDetalleVenta', data);
        setVenta(data.data)
    } catch (error) {
        console.log(error)
        
    }
  }

  peticionVenta(ventaId)
}, [ventaId])


  return (
    <div className='sticky top-10 left-0 right-0 bottom-0 bg-opacity-50 z-50'>
      <VentaDetalle {...venta}/>
    </div>
  )
}
