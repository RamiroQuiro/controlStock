// components/proveedores/EstadisticasProveedor.tsx

import formatDate from "../../../../../utils/formatDate";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";


interface EstadisticasProveedorProps {
  estadisticas: {
    // Estadísticas existentes
    totalGastado: number;
    promedioCompra: number;
    cantidadCompras: number;
    frecuenciaCompra: number;
    ultimaCompra: string;
    
    // Nuevas estadísticas sugeridas
    comprasMesActual: number;
    gastoMesActual: number;
    productosMasComprados: Array<{
      nombre: string;
      cantidad: number;
      total: number;
    }>;
    cumplimientoEntrega: number; // porcentaje
    tiempoPromedioEntrega: number; // días
    descuentosObtenidos: number;
    deudaPendiente: number;
    limiteCredito: number;
    diasCreditoPromedio: number;
  };
}

export const EstadisticasProveedor = ({ estadisticas }: EstadisticasProveedorProps) => {

    console.log(estadisticas)
  return (
    <div className="flex flex-wrap items-stretch justify-normal gap-3">
      {/* Métricas Financieras */}
      <div className="bg-primary-bg-componentes p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Métricas Financieras</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Total Histórico</p>
            <p className="text-2xl font-bold text-primary-600">
              {formateoMoneda.format(estadisticas?.totalGastado)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Compras Mes Actual</p>
            <p className="text-xl font-semibold text-green-600">
              {formateoMoneda.format(estadisticas?.gastoMesActual)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Deuda Pendiente</p>
            <p className="text-xl font-semibold text-red-600">
              {formateoMoneda.format(estadisticas?.deudaPendiente)}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas de Compras */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Actividad de Compras</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Total Compras</p>
            <p className="text-xl font-semibold">{estadisticas?.cantidadCompras}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Promedio por Compra</p>
            <p className="text-xl font-semibold">
              {formateoMoneda.format(estadisticas?.promedioCompra)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Frecuencia de Compra</p>
            <p className="text-xl font-semibold">
              {estadisticas?.frecuenciaCompra > 0
                ? `Cada ${estadisticas?.frecuenciaCompra} días`
                : "Primera compra"}
            </p>
          </div>
        </div>
      </div>

      {/* Productos Más Comprados */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Productos</h3>
        <div className="space-y-2">
          {estadisticas?.productosMasComprados.slice(0, 3).map((producto, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{producto.nombre}</p>
                <p className="text-sm text-gray-600">{producto.cantidad} unidades</p>
              </div>
              <p className="text-primary-600 font-medium">
                {formateoMoneda.format(producto.total)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de Rendimiento */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Rendimiento</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Cumplimiento de Entrega</p>
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${estadisticas?.cumplimientoEntrega}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {estadisticas?.cumplimientoEntrega}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tiempo Promedio de Entrega</p>
            <p className="text-xl font-semibold">
              {estadisticas?.tiempoPromedioEntrega} días
            </p>
          </div>
        </div>
      </div>

      {/* Crédito y Pagos */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Crédito y Pagos</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Límite de Crédito</p>
            <p className="text-xl font-semibold">
              {formateoMoneda.format(estadisticas?.limiteCredito)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Días de Crédito Promedio</p>
            <p className="text-xl font-semibold">
              {estadisticas?.diasCreditoPromedio} días
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Descuentos Obtenidos</p>
            <p className="text-xl font-semibold text-green-600">
              {formateoMoneda.format(estadisticas?.descuentosObtenidos)}
            </p>
          </div>
        </div>
      </div>

      {/* Última Actividad */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Última Actividad</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Última Compra</p>
            <p className="text-xl font-semibold">
              {formatDate(estadisticas?.ultimaCompra)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Compras Este Mes</p>
            <p className="text-xl font-semibold">{estadisticas?.comprasMesActual}</p>
          </div>
        </div>
      </div>
    </div>
  );
};