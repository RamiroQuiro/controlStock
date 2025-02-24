import { ArrowRight, ArrowRightFromLine, ArrowRightSquareIcon, Backpack, ChartNoAxesColumn, LucideStopCircle, StopCircle } from "lucide-react";
import React from "react";

export default function ModalCliente({ onClose, children }) {
  return (
    <div
      style={{ margin: 0, position: "fixed" }}
      className="fixed top-0 left-0 mt-0 w-full h-screen z-[80] bg-black bg-opacity-50 flex items-center  justify-center backdrop-blur-sm"
      onClick={() => onClose(false)} // Detectar clic fuera del modal
    >
        
      <div
        className="bg-primary-bg-componentes animate-aparecer relative rounded-lg overflow-y-auto border-l-2  text-border-primary-100/80 mt-0 shadow-lg min-h-[50vh]  w-[95vw]  md:w-[80vw]"
        onClick={(e) => e.stopPropagation()} // Evitar cerrar el modal al hacer clic dentro de él
      >
        <ArrowRightSquareIcon onClick={() => onClose(false)} className="absolute top-2  cursor-pointer hover:scale-x-110 object-left duration-300 right-3" />
        {children}
      </div>
    </div>
  );
}
