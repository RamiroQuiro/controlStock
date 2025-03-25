import React, { useEffect, useState } from 'react'
import VentaDetalle from '../VentaDetalle'


interface Props{
    ventaId:string
}
interface VentaDetalleProps {
    id: string;
    fecha: string;
    cliente: {
      nombre: string;
      dni: number;
      direccion?: string;
    };
    comprobante: {
      numero: string;
      metodoPago: string;
      nCheque: string;
      vencimientoCheque: string;
    };
    items: Array<{
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
      impuesto: number;
      descripcion: string;
    }>;
    totales: {
      subtotal: number;
      impuestos: number;
      descuentos: number;
      total: number;
    };
  }
  

export default function ContenedorVisorDetalleVenta({ventaId}:Props) {
    const [venta, setVenta] = useState<VentaDetalleProps>({
        cliente:{
            dni:0,
            nombre:"",
            direccion:""
        },
        comprobante:{
            metodoPago:"",
            nCheque:"",
            numero:"",
            vencimientoCheque:""
        },
        fecha:"",
        id:"",
        items:[],
        totales:{
            descuentos:0,
            impuestos:0,
            subtotal:0,
            total:0
        }
    })
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
        setVenta(data.data)
        console.log(data)
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
