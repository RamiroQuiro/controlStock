import React, { useEffect, useState } from 'react';
import { formateoMoneda } from '../../utils/formateoMoneda';

interface ProductoVendido {
  alertaStock: number;
  cantidadVendida: number;
  categoria: string;
  deposito: string;
  descripcion: string;
  id: string;
  nombre: string;
  pVenta: number;
  porcentajeCantidad: number;
  porcentajeMonto: number;
  stock: number;
  totalVendido: number;
  ubicacion: string;
}

const ProductosMasVendidos: React.FC<{ userId: string; empresaId: string }> = ({
  userId,
  empresaId,
}) => {
  const [topProductos, setTopProductos] = useState([]);
  const [selectRango, setSelectRango] = useState('mesActual');
  useEffect(() => {
    const fetching = async () => {
      try {
        const fetcher = await fetch('/api/sales/topVentas', {
          method: 'GET',
          headers: {
            'x-user-id': userId,
            'xx-empresa-id': empresaId,
            'filtro-selector': selectRango,
          },
        });

        const response = await fetcher.json();
        setTopProductos(response.data);
        // console.log("respuesta del backend ->", response);
      } catch (error) {
        console.log(error);
      }
    };

    fetching();
  }, [selectRango]);

  const onSelector = (e) => {
    setSelectRango(e.target.value);
  };

  return (
    <div className="w-full h-full items-stretch justify-normal flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Productos Más Vendidos</h2>
        <select onChange={onSelector} className="text-sm border rounded p-1">
          <option value={'mesActual'}>Este Mes</option>
          <option value={'mesAnterior'}>Último Mes</option>
          <option value={'añoActual'}>Este Año</option>
        </select>
      </div>

      <div className="space-y-4">
        {topProductos
          .slice(0, 6)
          .map((producto: ProductoVendido, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{producto.descripcion}</span>
                <div className="text-sm text-gray-600 flex gap-2">
                  <span>{producto.cantidadVendida} unidades</span>
                  <span>{formateoMoneda.format(producto.totalVendido)}</span>
                </div>
              </div>

              {/* Barra de progreso con tooltip */}
              <div className="relative w-full">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-100 h-2.5 rounded-full transition-all"
                    style={{ width: `${producto.porcentajeCantidad}%` }}
                    title={`${producto.porcentajeCantidad}% del total de unidades vendidas`}
                  ></div>
                </div>
              </div>

              {/* Estadísticas detalladas */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{producto.porcentajeCantidad}% del total</span>
                <div className="flex gap-2">
                  <span>Stock: {producto.stock}</span>
                  {producto.stock <= producto.alertaStock && (
                    <span className="text-red-500">¡Stock bajo!</span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-primary-100 text-sm font-medium hover:underline">
          Ver todos los productos
        </button>
      </div>
    </div>
  );
};

export default ProductosMasVendidos;
