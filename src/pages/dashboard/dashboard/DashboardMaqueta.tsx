import AlertasStock from "../../../components/dashboard/AlertasStock";
import EstadisticasVentas from "../../../components/dashboard/EstadisticasVentas";
import ProductosMasVendidos from "../../../components/dashboard/ProductosMasVendidos";
import RendimientoCategoria from "../../../components/dashboard/RendimientoCategoria";
import ResumenVentas from "../../../components/dashboard/ResumenVentas";
import UltimasTransacciones from "../../../components/dashboard/UltimasTransacciones";


const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
         
      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Ventas del Mes</p>
          <p className="text-2xl font-bold text-primary-100">$125,430</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-green-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              12.5%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. mes anterior</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Productos Bajos en Stock</p>
          <p className="text-2xl font-bold text-red-600">15</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-red-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              3
            </span>
            <span className="text-xs text-gray-500 ml-1">más que ayer</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Clientes Nuevos</p>
          <p className="text-2xl font-bold text-primary-texto">24</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-green-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              8.3%
            </span>
            <span className="text-xs text-gray-500 ml-1">este mes</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pedidos Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">7</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-yellow-600">3 urgentes</span>
          </div>
        </div>
      </div>
      
      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <ResumenVentas />
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <AlertasStock />
        </div>
      </div>
      
      {/* Segunda fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow">
          <ProductosMasVendidos />
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <EstadisticasVentas />
        </div>
      </div>
      
      {/* Tercera fila */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <UltimasTransacciones />
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <RendimientoCategoria />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;