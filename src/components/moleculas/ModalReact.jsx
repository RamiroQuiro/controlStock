import { XCircle } from 'lucide-react'
import React from 'react'

export default function ModalReact({onClose,children,className}) {
  return (
    <div
    style={{ margin: 0, position: "fixed" }}
    className="fixed top-0 left-0 mt-0 w-full h-screen z-[80] bg-black bg-opacity-50 flex items-center  justify-center backdrop-blur-sm"
    onClick={() => onClose(false)}
  >
    <div
      className={`bg-primary-bg-componentes relative rounded-lg overflow-hidden border-l-2 text-border-primary-100/80 mt-0 shadow-lg h- md:min-h-[50vh] overflow-y-auto md:min-w-[40vw] ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
          slot="close"
          onClick={() => onClose(false)}
          id="cerrarModal"
          className="absolute  top-2 right-2 cursor-pointer text-primary-texto active:-scale-95 duration-200 hover:text-primary-100"><XCircle/></button>
   {children}
    </div>
  </div>
  )
}
