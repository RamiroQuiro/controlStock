import React from 'react'
import EstadisticasCliente from './EstadisticasCliente'
import DivReact from '../../../../components/atomos/DivReact'

export default function ContenedorEstadisticaCliente({estadisticas}) {
  return (
    <DivReact className="">
        <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
        <EstadisticasCliente estadisticas={estadisticas} />
      </DivReact>
  )
}

