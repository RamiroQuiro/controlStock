import React from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";

export default function ImpuestosDescuentos({ formularioVenta, handleChange }) {
  console.log('formulario Venta ->',formularioVenta)
  return (
    <div className="w-full items-start my-2 justify-start gap-2 flex ">
      <div className="flex flex-cl w-1/3 items-center gap- justify-center">
        <label htmlFor="impuesto">Impuesto</label>
        <select
          name="impuesto"
          id="impuestosSelect"
          value={formularioVenta.impuesto}
          onChange={handleChange}
          className="w-full text-end capitalize py-1 px-1 text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
        >
          <option value="21%" className="px-3 w-full">
            21% iva
          </option>
          <option value="27%" className="px-3 w-full">
            27% iva
          </option>
          <option value="10.5%" className="px-3 w-full">
            10% iva
          </option>
          <option value="no aplica" className="px-3 w-full">
            no aplica
          </option>
        </select>
      </div>
      <div className="flex flex-cl w-full items-center gap-2 justify-center">
        <label htmlFor="descuentos">Descuentos</label>
        <div className="flex w-full items-center justify-normal gap-">
          <select
            name="signoDescuento"
            id="signoDescuento"
            className="w- text-end capitalize py-1 px-1  text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
          >
            <option value="porcentaje">%</option>
            <option value="monto">$</option>
          </select>
          <InputComponenteJsx
          placeholder={"ingrese el descuento"}
          className={'text-sm py-1 px-1'}
            name={"descuentos"}
            handleChange={handleChange}
            value={formularioVenta.descuentos}
            type={"number"}
          />
        </div>
      </div>
    </div>
  );
}
