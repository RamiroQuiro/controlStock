import React from 'react';

const ResumenVentas: React.FC = () => {
  // Datos de ejemplo para el gráfico
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const datos = [65000, 59000, 80000, 81000, 56000, 55000, 40000, 6000, 59000, 80000, 81000, 56000];
  
  // Encontrar el valor máximo para calcular las alturas relativas
  const maxValor = Math.max(...datos);
  
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Resumen de Ventas</h2>
        <select className="text-sm border rounded p-1">
          <option>Este Año</option>
          <option>Último Año</option>
          <option>Últimos 6 Meses</option>
        </select>
      </div>
      
      <div className="flex items-end h-64 space-x-2">
        {datos.map((valor, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-primary-100/60 hover:bg-primary-100 rounded-t transition-all duration-300"
              style={{ height: `${(valor / maxValor) * 100}%` }}
            >
              <div className="invisible group-hover:visible text-xs text-center text-white font-medium">
                {valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1">{meses[index]}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Ventas Totales</p>
          <p className="text-xl font-bold text-green-600">$1,245,000</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Ticket Promedio</p>
          <p className="text-xl font-bold text-blue-600">$8,500</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Transacciones</p>
          <p className="text-xl font-bold text-purple-600">1,450</p>
        </div>
      </div>
    </div>
  );
};

export default ResumenVentas;