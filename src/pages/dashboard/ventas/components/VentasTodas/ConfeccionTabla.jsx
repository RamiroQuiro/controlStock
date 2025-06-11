import React, { useEffect, useState } from "react";
import Table from "../../../../../components/tablaComponentes/Table";
import { columnasVentasTodas } from "../../../../../utils/columnasTables";
import formatDate from "../../../../../utils/formatDate";
import { SearchCheck } from "lucide-react";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";
import DivReact from "../../../../../components/atomos/DivReact";
import ContenedorVisorDetalleVenta from "./ContenedorVisorDetalleVenta";

export default function ConfeccionTabla({ userId, empresaId }) {
  const [seleccionador, setSeleccionador] = useState({
    id: null,
    "N°": null,
    nComprobante: null,
    cliente: null,
    direccionCliente: null,
    dniCliente: null,
    metodoPago: null,
    fechaVenta: null,
    total: null,
    acciones: null,
  });
  const selectRegistro = (e) => {
    setSeleccionador(e);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [newArray, setNewArray] = useState([]);
  useEffect(() => {
    const fetchCliente = async () => {
      const res = await fetch("/api/sales/todas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "xx-user-id": userId,
          "xx-empresa-id": empresaId,
        },
      });
      const data = await res.json();
      setNewArray(
        data?.data?.map((venta, i) => {
          const fecha = formatDate(venta.fecha);
          return {
            id: venta.id,
            "N°": i + 1,
            nComprobante: venta.nComprobante,
            cliente: venta.cliente,
            dniCliente: venta.dniCliente,
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
        })
      );
      setSeleccionador(newArray[0]);
      setIsLoading(false);
    };
    fetchCliente();
  }, [isLoading]);



  return (
    <div className="w-full flex items-start relative   justify-between gap-3">
      <div className="w-full overflow-x-auto">
      {isLoading ? (
        <div
          colSpan={"2"}
          className="border-b last:border-0 text-xs font-semibold animate-pulse bg-white text-center p-4"
        >
          Cargando...
        </div>
      ) : (
      <Table
        columnas={columnasVentasTodas}
        arrayBody={newArray}
        onClickRegistro={selectRegistro}
        />
      )
      
    }
    </div>
      <div className="md:flex items-center justify-center gap-2 w-1/3 hidden sticky top-4">
        <DivReact>
          
          <ContenedorVisorDetalleVenta ventaId={seleccionador?.id} />
        </DivReact>
      </div>
    </div>
  );
}
