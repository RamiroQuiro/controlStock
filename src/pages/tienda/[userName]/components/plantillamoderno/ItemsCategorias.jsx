import React from 'react'

export default function ItemsCategorias({name,onClick,isOpen,children}) {
  return (
        <li className="w-full flex-auto">
          <button
            onClick={onClick}
            className={`${isOpen&& ''} px-3 py-1 tracking-wide bg-primary-bg-componentes duration-300 hover:bg-primary-textoTitle/80 rounded-md text-primary-texto w-full text-left hover:text-white text-sm gap-2 cursor-pointer  group`}
          >
            <div className="w-full flex items-center justify-between ">
              <span className="text-left w-4/6">{name}</span>
            
            </div>
          </button>
        </li>
  )
}
