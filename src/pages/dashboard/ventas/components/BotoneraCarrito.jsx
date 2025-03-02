import { Captions, SendToBack, StopCircle, Table2 } from 'lucide-react'
import React from 'react'

export default function BotoneraCarrito({totalVenta, pagar}) {
  return (
    <div className="flex flex-col items-center  justify-normal w-full space-y-2">
          <button
            id="btnPagar"
            disabled={totalVenta == 0 ? true : false}
            onClick={pagar}
            className="rounded-lg disabled:bg-blue-600/50 text-white text-center flex items-center pl- justify-center hover:bg-blue-600/80 duration-300 mt-8 m border-2 border-gray-200 h-12 w-full bg-blue-600"
          >
            <Captions className="w-10 h-10" />{" "}
            <p className="text-3xl ml-4 font- font-mono widest ">
              Pagar
            </p>
          </button>
          <button
            id="btnPagar"
            disabled={totalVenta == 0 ? true : false}
            onClick={pagar}
            className="rounded-lg disabled:bg-green-600/50 text-white text-center flex items-center pl- justify-center hover:bg-green-600/80 duration-300 mt-8 m border-2 border-gray-200 h-12 w-full bg-green-600"
          >
            <Table2 className="w-8 h-8" />{" "}
            <p className="text-2xl ml-4 font- font-mono widest ">
              Presupuesto
            </p>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg disabled:bg-blue-600/50 -translate-y- flex items-center  justify-center hover:bg-blue-600/40 duration-300 mt-10 mb-4 border-2 border-primary-texto h-12 w-full bg-gray-100 text-primary-texto"
          >
            <StopCircle className="w-10 h-10" />{" "}
            <p className="text-3xl ml-4 font- font-mono widest ">
              Cancelar
            </p>
          </button>
        </div>
  )
}
