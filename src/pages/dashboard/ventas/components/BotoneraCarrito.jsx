import { Captions, StopCircle } from 'lucide-react'
import React from 'react'

export default function BotoneraCarrito({totalVenta, finalizarCompra}) {
  return (
    <div className="flex flex-col items-start justify-normal w-full space-y-2">
          <button
            id="btnPagar"
            disabled={totalVenta == 0 ? true : false}
            onClick={finalizarCompra}
            className="rounded-lg disabled:bg-blue-600/50 text-white flex items-center pl-4 justify-start hover:bg-blue-600/80 duration-300 mt-8 m border-2 border-gray-200 h-16 w-full bg-blue-600"
          >
            <Captions className="w-10 h-10" />{" "}
            <p className="text-3xl ml-4 font-semibold font-mono widest ">
              Pagar
            </p>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg disabled:bg-blue-600/50 -translate-y- flex items-center pl-4 justify-start hover:bg-blue-600/40 duration-300 mt-10 mb-4 border-2 border-primary-texto h-16 w-full bg-gray-100 text-primary-texto"
          >
            <StopCircle className="w-10 h-10" />{" "}
            <p className="text-3xl ml-4 font-semibold font-mono widest ">
              Cancelar
            </p>
          </button>
        </div>
  )
}
