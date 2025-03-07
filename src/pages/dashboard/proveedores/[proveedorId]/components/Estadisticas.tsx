import React from 'react'
import { formateoMoneda } from '../../../../../utils/formateoMoneda';

type EstadisticaProveedor = {
  totalGastado: number;
  promedioCompra: number;
  cantidadCompras: number;
  frecuenciaCompra: number;
  ultimaCompra: string;
};

 const Estadisticas = ({
    estadisticasProveedor,
  }: {
    estadisticasProveedor: EstadisticaProveedor;
  }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
    <div className="bg-primary-100/10 rounded-lg p-4">
      <p className="text-sm text-gray-600">Total Comprado</p>
      <p className="text-2xl font-bold text-primary-100">
        {formateoMoneda.format(estadisticasProveedor.totalGastado)}
      </p>
    </div>

    <div className="bg-primary-texto/10 rounded-lg p-4">
      <p className="text-sm text-gray-600">Promedio por Compra</p>
      <p className="text-2xl font-bold text-primary-texto">
        {formateoMoneda.format(estadisticasProveedor.promedioCompra)}
      </p>
    </div>

    <div className="bg-green-50 rounded-lg p-4">
      <p className="text-sm text-gray-600">Cantidad de Compras</p>
      <p className="text-2xl font-bold text-green-600">
        {estadisticasProveedor.cantidadCompras}
      </p>
    </div>

    <div className="bg-blue-50 rounded-lg p-4">
      <p className="text-sm text-gray-600">Frecuencia de Compra</p>
      <p className="text-2xl font-bold text-blue-600">
        {estadisticasProveedor.frecuenciaCompra > 0
          ? `Cada ${estadisticasProveedor.frecuenciaCompra} días`
          : "Primera compra"}
      </p>
    </div>
  </div>
  )
}
export default Estadisticas