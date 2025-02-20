import React from 'react'

export default function ModalConfirmacion({handleCancelar,handleConfirmar}) {
  return (
    <div className="fixed h-full inset-0 flex items-center justify-center -translate-y-3 backdrop-blur-sm bg-black bg-opacity-50 z-50">
    <div className="bg-white p-4 rounded-md absolute top-16 shadow-md">
      <h3 className="text-lg font-semibold mb-2">¿Estás seguro de eliminar este producto?</h3>  
      <div className="flex justify-evenly gap-2">
        <button onClick={handleCancelar} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
          Cancelar
        </button>
        <button onClick={handleConfirmar} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Eliminar
        </button>
      </div>
    </div>
  </div>
  )
}
