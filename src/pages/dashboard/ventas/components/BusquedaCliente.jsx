import React, { useState } from 'react'
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx'

export default function BusquedaCliente({handleCliente}) {



  return (
    <div className="w-full mt-3 inline-flex">
    <InputComponenteJsx name={'cliente'} id={'inputBusquedaCliente'} type={'search'} placeholder={'Busqueda Cliente'} handleChange={handleCliente} />
  </div>
  )
}
