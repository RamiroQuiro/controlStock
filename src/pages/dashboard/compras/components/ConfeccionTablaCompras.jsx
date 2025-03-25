import { SearchCheck } from "lucide-react";
import DivReact from "../../../../components/atomos/DivReact";
import Table from "../../../../components/tablaComponentes/Table";
import { formateoMoneda } from "../../../../utils/formateoMoneda";
import formatDate from "../../../../utils/formatDate";
import { useState } from "react";
import { columnasComprasTodas, columnasVentasTodas } from "../../../../utils/columnasTables";
import ContenedorVisorCompras from "./ContenedorVisorCompras";

export default function ConfeccionTablaCompras({ data }) {
  const [seleccionador, setseleccionador] = useState(data[0])
  const selectRegistro=(e)=>{
    setseleccionador(e)
  }
  const newArray = data?.map((compra, i) => {
    const fecha = formatDate(compra.fecha);
    return {
      id:compra.id,
      "N°": i + 1,
      nComprobante: compra.nComprobante,
      proveedor: compra.proveedor,
      dniProveedor: compra.dniProveedor,
      metodoPago: compra.metodoPago,
      fechaVenta: fecha,
      total: formateoMoneda.format(compra.total),
      acciones: (
        <div className="flex items-center justify-center gap-2 w-full">
         
          <button
            id="verVenta"
            onClick={() =>
              (window.location.href = `/dashboard/compra/${compra.id}`)
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
      <Table columnas={columnasComprasTodas} arrayBody={newArray} onClickRegistro={selectRegistro} />
      <div className="flex items-center justify-center gap-2 w-1/3 sticky top-4">
             <DivReact>
              <ContenedorVisorCompras ventaId={1}/>
        </DivReact>
      </div>
    </div>
  );
}
