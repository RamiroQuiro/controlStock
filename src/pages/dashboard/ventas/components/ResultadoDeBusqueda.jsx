import { useStore } from '@nanostores/react'
import React, { useEffect, useState } from 'react'
import { filtroBusqueda } from '../../../../context/store'

export default function ResultadoDeBusqueda() {
  const $filtro=useStore(filtroBusqueda).filtro
const [productosSeleccionados, setProductosSeleccionados] = useState([])


useEffect(() => {
  const agregarProducto = () => {
    setProductosSeleccionados([...productosSeleccionados, $filtro])
  }
agregarProducto()
}, [$filtro])


  return (
<div className='flex flex-fol items-center justify-start gap-2 '>
{
  productosSeleccionados.length==0?(
    <div className='p-3 '>
      <p>No hay elementos para mostrar</p>
    </div>
  ):(
    productosSeleccionados.map((item,i)=>(
      <div key={i} className='flex flex-row items-center justify-start gap-2'>
        <p>{item}</p>
        <button onClick={()=>setProductosSeleccionados(productosSeleccionados.filter((producto,index)=>index!==i))}>X</button>
      </div>
    ))
  )
}
</div>


  )
}
