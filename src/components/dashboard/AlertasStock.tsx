import React from 'react';

interface AlertaStock {
  producto: string;
  stock: number;
  stockMinimo: number;
  categoria: string;
}

const AlertasStock: React.FC = () => {
  const alertas: AlertaStock[] = [
    {
      producto: "Producto A",
      stock: 5,
      stockMinimo: 10,
      categoria: "Categoría 1"
    },
    {
      producto: "Producto B",
      stock: 2,
      stockMinimo: 15,
      categoria: "Categoría 2"
    },
    // Más productos...
  ];

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Alertas de Stock</h2>
      <div className="space-y-4">
        {alertas.map((alerta, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
          >
            <div>
              <h3 className="font-medium text-red-700">{alerta.producto}</h3>
              <p className="text-sm text-red-600">
                Stock: {alerta.stock} / Mínimo: {alerta.stockMinimo}
              </p>
              <span className="text-xs text-gray-500">{alerta.categoria}</span>
            </div>
            <div className="text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertasStock;