import React from 'react'

export default function CarritoAnimacionVacio() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4">
    <div className="relative w-40 h-40 mb-6">
      <svg 
        className="w-full h-full text-gray-300 animate-waving-hand" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
        />
        <path 
          className="opacity-0 animate-ping"
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1} 
          d="M20 4v16l-4-4H5.5a1.5 1.5 0 01-1.5-1.5v-13A1.5 1.5 0 015.5 4H20z" 
        />
      </svg>
    </div>
    <p className="text-gray-500 text-lg font-medium">No hay productos disponibles</p>
    <p className="text-gray-400 text-sm mt-2">Prueba con otra categoría o búsqueda</p>
  </div>
  )
}
