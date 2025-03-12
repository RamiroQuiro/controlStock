import React from "react";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";
import { Circle, CircleAlertIcon, Redo2Icon } from "lucide-react";

export default function VariacionPrecioProductos({ variacionPrecios }) {
  const columnas = [
    { label: "producto", id: 1, selector: (row) => row.producto },
    { label: "anterior", id: 3, selector: (row) => row.anterior },
    { label: "actual", id: 4, selector: (row) => row.actual },
    { label: "variacion", id: 7, selector: (row) => row.variacion },
  ];

  return (
    <div className="bg-white rounded-lg text-sm shadow py-3 overflow-auto mx-auto">
      <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden border">
        <thead>
          <tr className="">
            {columnas.map((col) => (
              <th key={col.id} className="px-2 py-1 font-semibold capitalize text-left cursor-pointer hover:bg-gray-100">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variacionPrecios.map((item) => (
            <tr  key={item.productoId} className="border-t hover:bg-gray-50 text-sm">
              <td className=" py-1 px-1">{item.productoId}</td>
              <td className=" py-1 px-1">
                {formateoMoneda.format(item.precioAnterior)}
              </td>
              <td className=" py-1 px-1">
                {formateoMoneda.format(item.precioActual)}
              </td>
              <td
                className={` text-right flex items-center gap- py-1 px-1 justify-evenly h-full font-semibold ${
                  item.variacion > 0 ? "text-red-500" : "text-green-500"
                }`}
              >
               <Circle className={` w-4 h-4 `}/> {item.variacion.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
