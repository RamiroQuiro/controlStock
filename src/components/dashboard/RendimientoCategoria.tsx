import React, { useEffect, useState } from 'react';

interface CategoriaRendimiento {
  nombre: string;
  porcentaje: number;
  tendencia: 'subida' | 'bajada' | 'estable';
  color: string;
  totalVentas: number;
}

interface DatosRendimiento {
  categorias: CategoriaRendimiento[];
  rendimientoPromedio: number;
}

const RendimientoCategoria: React.FC = ({ userId }: { userId: string }) => {
  const [datosRendimiento, setDatosRendimiento] = useState<DatosRendimiento>({
    categorias: [],
    rendimientoPromedio: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRendimiento = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ventas/rendimientoCategoria', {
          headers: {
            'x-user-id': userId
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos');
        }

        const data = await response.json();
        setDatosRendimiento(data);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRendimiento();
  }, [userId]);

  const formatoMoneda = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  });

  const getTendenciaLabel = (tendencia: string, porcentaje: number) => {
    switch (tendencia) {
      case 'subida':
        return <span className="text-xs text-green-500">↑ {porcentaje}% vs mes anterior</span>;
      case 'bajada':
        return <span className="text-xs text-red-500">↓ {porcentaje}% vs mes anterior</span>;
      default:
        return <span className="text-xs text-gray-500">Sin cambios vs mes anterior</span>;
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subida':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'bajada':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-start justify-normal">
        <h2 className="text-lg font-semibold mb-4">Rendimiento por Categoría</h2>
        <div className="flex flex-wrap w-full">
          {[1, 2, 3].map((_, index) => ( // Mostramos 3 skeletons
            <div key={index} className="flex items-center group animate-pulse hover:bg-white duration-300 hover:shadow-sm bg-primary-bg-componentes w-full  border p-2 rounded-lg transition-all">
            <div className="relative w-16 h-16 mr-4">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={"bg-gray-500"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">" "</h3>
                  
                </div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-sm font-medium">
                  </div>
                  <div className="text-xs text-gray-500">
                    Total vendido
                  </div>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="w-full bg-gray-200 rounded-full h-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Rendimiento por Categoría</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 w-full items-center">
        {datosRendimiento.categorias.map((categoria, index) => (
          <div key={index} className="flex items-center group hover:bg-white duration-300 hover:shadow-sm bg-primary-bg-componentes w-full  border p-2 rounded-lg transition-all">
            <div className="relative w-16 h-16 mr-4">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={categoria.color}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40 * categoria.porcentaje / 100} ${2 * Math.PI * 40 * (1 - categoria.porcentaje / 100)}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-sm font-medium">{categoria.porcentaje}%</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{categoria.nombre}</h3>
                  {getTendenciaLabel(categoria.tendencia, categoria.porcentaje)}
                </div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-sm font-medium">
                    {formatoMoneda.format(categoria.totalVentas)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total vendido
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {datosRendimiento.categorias.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No hay datos de categorías disponibles</p>
        </div>
      )}
    </div>
  );
};

export default RendimientoCategoria;