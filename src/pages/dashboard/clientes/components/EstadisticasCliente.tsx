import { formateoMoneda } from '../../../../utils/formateoMoneda';

interface Estadisticas {
  totalGastado: number;
  promedioCompra: number;
  frecuenciaCompra: number;
  cantidadCompras: number;
}


export default function EstadisticasCliente({ estadisticas,loading }: { estadisticas: Estadisticas,loading:boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className={`${loading&&'animate-pulse'} bg-primary-100/10 rounded-lg p-4`}>
        <p className="text-sm text-gray-600">Total Gastado</p>
        <p className="text-2xl font-bold text-primary-100">
          {formateoMoneda.format(estadisticas.totalGastado)}
        </p>
      </div>

     <div className={`${loading&&'animate-pulse'} bg-primary-texto/10 rounded-lg p-4`}>
        <p className="text-sm text-gray-600">Promedio por Compra</p>
        <p className="text-2xl font-bold text-primary-texto">
          {formateoMoneda.format(estadisticas.promedioCompra)}
        </p>
      </div>

     <div className={`${loading&&'animate-pulse'}bg-green-50 rounded-lg p-4`}>
        <p className="text-sm text-gray-600">Cantidad de Compras</p>
        <p className="text-2xl font-bold text-green-600">
          {estadisticas.cantidadCompras}
        </p>
      </div>

     <div className={`${loading&&'animate-pulse'} bg-blue-50 rounded-lg p-4`}>
        <p className="text-sm text-gray-600">Frecuencia de Compra</p>
        <p className="text-2xl font-bold text-blue-600">
          {estadisticas.frecuenciaCompra > 0 
            ? `Cada ${estadisticas.frecuenciaCompra} días`
            : 'Primera compra'}
        </p>
      </div>
    </div>
  );
} 