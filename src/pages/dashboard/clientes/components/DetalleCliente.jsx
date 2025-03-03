import React from 'react'
import DivReact from '../../../../components/atomos/DivReact'

export default function DetalleCliente({cliente}) {
  return (
    <DivReact className="">
    <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-600">DNI</p>
        <p className="font-medium">{cliente.dni}</p>
      </div>
      <div>
        <p className="text-gray-600">Teléfono</p>
        <p className="font-medium">{cliente.telefono || '-'}</p>
      </div>
      <div>
        <p className="text-gray-600">Email</p>
        <p className="font-medium">{cliente.email || '-'}</p>
      </div>
      <div>
        <p className="text-gray-600">Dirección</p>
        <p className="font-medium">{cliente.direccion || '-'}</p>
      </div>
      <div>
        <p className="text-gray-600">Categoría</p>
        <span className={`px-2 py-1 rounded-full text-xs ${
          cliente.categoria === 'VIP' 
            ? 'bg-purple-100 text-purple-800' 
            : cliente.categoria === 'regular'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {cliente.categoria}
        </span>
      </div>
      <div>
        <p className="text-gray-600">Estado</p>
        <span className={`px-2 py-1 rounded-full text-xs ${
          cliente.estado === 'activo' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {cliente.estado}
        </span>
      </div>
    </div>

    {cliente.observaciones && (
      <div className="mt-4">
        <p className="text-gray-600">Observaciones</p>
        <p className="mt-1">{cliente.observaciones}</p>
      </div>
    )}
  </DivReact>
  )
}
