import React, { useState } from "react";
import Table from "../../../../../components/tablaComponentes/Table";
import { columnasVentasTodas } from "../../../../../utils/columnasTables";
import formatDate from "../../../../../utils/formatDate";
import { ArrowBigUpDash, MoveRight, Printer, SearchCheck } from "lucide-react";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";
import DivReact from "../../../../../components/atomos/DivReact";
import VentaDetalle from "../VentaDetalle";
import ContenedorVisorDetalleVenta from "./ContenedorVisorDetalleVenta";

export default function ConfeccionTabla({ data }) {
  const [seleccionador, setseleccionador] = useState(data[0])
  const selectRegistro=(e)=>{
    setseleccionador(e)
  }
  const newArray = data?.map((venta, i) => {
    const fecha = formatDate(venta.fecha);
    return {
      id:venta.id,
      "N°": i + 1,
      nComprobante: venta.nComprobante,
      cliente: venta.clienteId,
      dniCliente: venta.clienteId,
      metodoPago: venta.metodoPago,
      fechaVenta: fecha,
      total: formateoMoneda.format(venta.total),
      acciones: (
        <div className="flex items-center justify-center gap-2 w-full">
         
          <button
            id="verVenta"
            onClick={() =>
              (window.location.href = `/dashboard/ventas/${venta.id}`)
            }
            className="bg-primary-bg-componentes relative rounded-full group py-0.5 px-1"
          >
            {" "}
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[103%] bg-primary-textoTitle/90 px-1 py-0.5 w-16 text-xs text-white hidden group-hover:flex items-center  justify-center animate-aparecer">
              ver venta
            </span>
            <SearchCheck className="stroke-green-500 w-5 " />
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="w-full flex items-start relative   justify-between gap-3">
      <Table columnas={columnasVentasTodas} arrayBody={newArray} onClickRegistro={selectRegistro} />
      <div className="flex items-center justify-center gap-2 w-1/3 sticky top-4">
             <DivReact>
              <ContenedorVisorDetalleVenta ventaId={seleccionador.id}/>
        </DivReact>
      </div>
    </div>
  );
}
