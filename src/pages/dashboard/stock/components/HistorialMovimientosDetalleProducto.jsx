import { History } from 'lucide-react'
import DivReact from '../../../../components/atomos/DivReact'
import Table from '../../../../components/tablaComponentes/Table'

export default function HistorialMovimientosDetalleProducto({newArray, columnas}) {
  return (
      <DivReact>
      <h3 className="flex  items-center gap-4 text-lg font-semibold text-gray-700 mb-2">
        <History /> Historial de Movimiento
      </h3>
      <Table arrayBody={newArray.reverse()} columnas={columnas} />
    </DivReact>
  )
}
