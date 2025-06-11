import React from 'react'
import { useStore } from '@nanostores/react'
import { tiendaStore } from '../../../../../context/store'

export default function Titulo2() {
    const {data} = useStore(tiendaStore);
  return (
    <h2 class="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      {data?.configuracionEmpresa?.titulo2}
    </h2>
  )
}
