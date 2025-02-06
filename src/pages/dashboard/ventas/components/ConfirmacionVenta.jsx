import React from "react";

export default function ConfirmacionVenta({productos, totalVenta, setModalConfirmacion, finalizarCompra}) { 
  return (
    <>
      <h2 className="text-lg font-semibold text-primary-textoTitle">
        Confirmar Venta
      </h2>
      <div className="flex flex-col items-start justify-start mt-2  w-full pb-3 mb-3">
        <p className="text-sm font-semibold">Resumen de la venta:</p>
        <ul className="text-  space- mt-2 w-full overflow-y-auto space-y-0.5">
          {productos.map((producto, index) => (
            <li
              key={index}
              className="flex justify-between boder-b items-center bg-primary-bg-componentes px-0.5  text-sm gap-3 font-IndieFlower  w-full capitalize "
            >
              <span>
                {producto.descripcion} ({producto.cantidad} x ${producto.precio}
                )
              </span>
              <span className="text text-primary-textoTitle">
                ${producto.cantidad * producto.precio}
              </span>
            </li>
          ))}
        </ul>
        {/* total de centa */}
        <div className="w-full border-b py-2 flex items-center justify-between">
          <h2 className=" font-semibold text-primary-">Total :</h2>
          <span className="text-primary-textoTitle font-semibold">
            $ {totalVenta.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="w-full border-b pb-4">
        <h2 className=" font-semibold text-primary-">Metodo de pago</h2>
        <select
          name="metodoPago"
          id="metodoPago"
          className="mt-0.5 w-full text-sm rounded-lg p-2 border outline-none focus:ring "
        >
          <option className="text-sm" value="boleta">
            Efectivo
          </option>
          <option className="text-sm" value="factura">
            Transferencia
          </option>
          <option className="text-sm" value="ticket">
            QR
          </option>
          <option className="text-sm" value="ticket">
            Debito
          </option>
        </select>
      </div>

      {/*  */}
      <div className="mt-4 mb-4">
        <p>¿Desea finalizar la compra?</p>
        <div className="flex justify-end  gap-4 mt-4 w-full ">
          <button
            onClick={() => setModalConfirmacion(false)}
            className=" ring ring-primary-400 hover:text-white duration-200 hover:bg-primary-400 px-3 py1 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={finalizarCompra}
            className=" bg-primary-100 text-white duration-200 hover:bg-primary-100  px-4 py-2 rounded-lg"
          >
            Confirmar
          </button>
        </div>
      </div>
    </>
  );
}
