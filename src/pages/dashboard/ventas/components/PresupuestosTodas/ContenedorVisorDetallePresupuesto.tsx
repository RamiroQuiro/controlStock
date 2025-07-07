import React, { useEffect, useState } from 'react'
import VentaDetalle from '../VentaDetalle'
import type { PresupuestoDetalle } from '../../../../../services/presupuestos.service';


interface Props{
  presupuestoId:string
}

  

export default function ContenedorVisorDetalleVenta({presupuestoId}:Props) {
    const [presupuesto, setPresupuesto] = useState<PresupuestoDetalle>()
useEffect(() => {
  const peticionVenta=async()=>{
    try {
        const response=await fetch(`/api/presupuestos/${presupuestoId}`,{
            method:'GET',
            headers:{
                'x-user-id':'1'
            }
        })
        const data=await response.json()
        console.log('data en el contenedorVisorDetalleVenta', data);
        setPresupuesto(data.data)
    } catch (error) {
        console.log(error)
        
    }
  }

  peticionVenta(presupuestoId)
}, [presupuestoId])


  return (
    <div className='sticky top-10 left-0 right-0 bottom-0 bg-opacity-50 z-50'>
      <VentaDetalle {...presupuesto}/>
    </div>
  )
}
