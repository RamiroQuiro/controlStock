import React from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";

export default function ImpuestosDescuentos({ formularioVenta, handleChange }) {
  return (
    <div className="w-full items-start my-2 justify-start flex flex-col">
      <div className="flex flex-col w-full items-start justify-normal">
        <label htmlFor="impuesto">Impuesto</label>
        <select
          name="impuesto"
          id="impuestosSelect"
          value={formularioVenta.impuesto}
          onChange={handleChange}
          className="w-full text-end capitalize py-2 px-5 text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
        >
          <option value="iva21" className="px-3 w-full">
            21% iva
          </option>
          <option value="iva27" className="px-3 w-full">
            27% iva
          </option>
          <option value="iva10" className="px-3 w-full">
            10% iva
          </option>
        </select>
      </div>
      <div className="flex flex-col w-full items-start justify-normal">
        <label htmlFor="descuentos">Descuentos</label>
        <div className="flex w-full items-center justify-normal gap-2">
          <select
            name="signoDescuento"
            id="signoDescuento"
            className="w- text-end capitalize py-2 px-3  text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
          >
            <option value="porcentaje">%</option>
            <option value="monto">$</option>
          </select>
          <InputComponenteJsx
          placeholder={"ingrese el descuento"}
          className={'text-sm'}
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
