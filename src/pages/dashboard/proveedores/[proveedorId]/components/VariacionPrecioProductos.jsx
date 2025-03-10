import React from 'react'

export default function VariacionPrecioProductos({estadisticasProveedor}) {
  return (
    <div className="bg-yellow-50 rounded-lg p-4">
    <p className="text-sm text-gray-600">Variación de Precios</p>
    {/* {estadisticasProveedor?.variacionPrecios.map((item) => (
      <div key={item.productoId} className="flex justify-between">
        <p className="text-sm">{item.descripcion}</p>
        <p
          className={`text-lg font-bold ${
            item.variacion > 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {item.variacion.toFixed(2)}%
        </p>
      </div>
    ))} */}
  </div>
  
  )
}
