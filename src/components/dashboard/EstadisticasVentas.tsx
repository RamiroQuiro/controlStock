import React from 'react';

const EstadisticasVentas: React.FC = () => {
  const estadisticas = [
    {
      titulo: "Ventas por Categoría",
      datos: [
        { nombre: "Electrónica", valor: 50 },
        { nombre: "Ropa", valor: 25 },
        { nombre: "Hogar", valor: 20 },
        { nombre: "Alimentos", valor: 15 },
        { nombre: "Otros", valor: 5 }
      ]
    },
    {
      titulo: "Métodos de Pago",
      datos: [
        { nombre: "Efectivo", valor: 40 },
        { nombre: "Tarjeta de Crédito", valor: 35 },
        { nombre: "Transferencia", valor: 15 },
        { nombre: "Otros", valor: 10 }
      ]
    }
  ];

  const colores = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500", 
    "bg-red-500", "bg-purple-500", "bg-pink-500"
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Estadísticas de Ventas</h2>
      
      <div className="space-y-6">
        {estadisticas.map((seccion, seccionIndex) => (
          <div key={seccionIndex}>
            <h3 className="font-medium text-gray-700 mb-2">{seccion.titulo}</h3>
            <div className="space-y-2">
              {seccion.datos.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{item.nombre}</span>
                    <span className="text-sm font-medium">{item.valor}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colores[itemIndex % colores.length]} h-2 rounded-full`} 
                      style={{ width: `${item.valor}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-primary-100/10 rounded-lg p-3">
          <p className="text-sm text-gray-600">Tasa de Conversión</p>
          <p className="text-xl font-bold text-primary-100">24.8%</p>
          <p className="text-xs text-green-600">+2.3% vs mes anterior</p>
        </div>
        <div className="bg-primary-texto/10 rounded-lg p-3">
          <p className="text-sm text-gray-600">Devoluciones</p>
          <p className="text-xl font-bold text-primary-texto">3.2%</p>
          <p className="text-xs text-green-600">-0.5% vs mes anterior</p>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasVentas;