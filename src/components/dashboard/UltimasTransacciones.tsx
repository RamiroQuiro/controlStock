import React from 'react';

interface Transaccion {
  id: string;
  cliente: string;
  fecha: string;
  monto: number;
  estado: 'completada' | 'pendiente' | 'cancelada';
  metodoPago: string;
}

const UltimasTransacciones: React.FC = () => {
  const transacciones: Transaccion[] = [
    {
      id: "VTA-1234",
      cliente: "Juan Pérez",
      fecha: "2023-11-15 14:30",
      monto: 12500,
      estado: "completada",
      metodoPago: "Efectivo"
    },
    {
      id: "VTA-1235",
      cliente: "María González",
      fecha: "2023-11-15 12:45",
      monto: 8750,
      estado: "completada",
      metodoPago: "Tarjeta de Crédito"
    },
    {
      id: "VTA-1236",
      cliente: "Carlos Rodríguez",
      fecha: "2023-11-15 11:20",
      monto: 15000,
      estado: "pendiente",
      metodoPago: "Transferencia"
    },
    {
      id: "VTA-1237",
      cliente: "Ana Martínez",
      fecha: "2023-11-15 10:15",
      monto: 5200,
      estado: "completada",
      metodoPago: "Efectivo"
    },
    {
      id: "VTA-1238",
      cliente: "Roberto López",
      fecha: "2023-11-14 16:50",
      monto: 9800,
      estado: "cancelada",
      metodoPago: "Tarjeta de Débito"
    }
  ];

  const getEstadoClase = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Últimas Transacciones</h2>
        <button className="text-primary-100 text-sm font-medium hover:underline">
          Ver todas
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transacciones.map((transaccion) => (
              <tr key={transaccion.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-100">
                  {transaccion.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaccion.cliente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaccion.fecha}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaccion.monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClase(transaccion.estado)}`}>
                    {transaccion.estado.charAt(0).toUpperCase() + transaccion.estado.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaccion.metodoPago}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UltimasTransacciones;