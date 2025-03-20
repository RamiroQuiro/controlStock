import React from 'react';

interface CategoriaRendimiento {
  nombre: string;
  porcentaje: number;
  tendencia: 'subida' | 'bajada' | 'estable';
  color: string;
}

const RendimientoCategoria: React.FC = () => {
  const categorias: CategoriaRendimiento[] = [
    {
      nombre: "Electrónica",
      porcentaje: 78,
      tendencia: "subida",
      color: "text-blue-500"
    },
    {
      nombre: "Ropa",
      porcentaje: 65,
      tendencia: "estable",
      color: "text-green-500"
    },
    {
      nombre: "Hogar",
      porcentaje: 42,
      tendencia: "bajada",
      color: "text-yellow-500"
    },
    {
      nombre: "Alimentos",
      porcentaje: 89,
      tendencia: "subida",
      color: "text-purple-500"
    }
  ];

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

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Rendimiento por Categoría</h2>
      
      <div className="space-y-6">
        {categorias.map((categoria, index) => (
          <div key={index} className="flex items-center">
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
            
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{categoria.nombre}</h3>
                <div className="ml-2">
                  {getTendenciaIcon(categoria.tendencia)}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {categoria.tendencia === 'subida' ? 'En crecimiento' : 
                 categoria.tendencia === 'bajada' ? 'En descenso' : 'Estable'}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">Rendimiento promedio: <span className="font-medium">68.5%</span></p>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-100 h-2 rounded-full" style={{ width: '68.5%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RendimientoCategoria;