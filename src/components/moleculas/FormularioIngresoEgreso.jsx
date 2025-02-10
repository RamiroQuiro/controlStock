import { LogOut } from "lucide-react";
import React, { useState } from "react";

export default function FormularioIngresoEgreso({ children }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpenModal(true)}
        className={`bg-primary-bg-ntes text-sm border-dashed hover:bg-primary-150 hover:text-black hover:border-primary-100/70 active:scale-95   rounded-xl px-2 py-1.5 border border-primary-texto/70  duration-200 `}
        >{children}</button>

      {isOpenModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setIsOpenModal(false)} // Detectar clic fuera del modal
        >
          <div
            className="bg-primary-bg-componentes relative rounded-lg border-l-2 text-border-primary-100/80 shadow-lg h-[95vh] overflow-y-auto p-4 w-2/3"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar el modal al hacer clic dentro de él
          >
            <button
              onClick={() => setIsOpenModal(false)}
              className="absolute bg-gray-100 p-1 rounded-full hover:translate-x-0.5 active:scale-95 duration-200 top-3 right-3 "
            >
              <LogOut />
            </button>
            {isLoading ? (
              <div className="text-center">Cargando...</div>
            ) : (
             <p>Formulario</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
