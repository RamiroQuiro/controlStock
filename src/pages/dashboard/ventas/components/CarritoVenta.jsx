import { useStore } from '@nanostores/react'
import React from 'react'
import { productosSeleccionadosVenta } from '../../../../context/store'

export default function CarritoVenta() {

  const $productos=useStore(productosSeleccionadosVenta)
console.log($productos)
  return (
    <div>
      
    </div>
  )
}
