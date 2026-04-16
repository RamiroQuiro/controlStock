import React, { useEffect, useState } from "react";
import Table from "../../../../../components/tablaComponentes/Table";
import { columnasVentasTodas } from "../../../../../utils/columnasTables";
import formatDate from "../../../../../utils/formatDate";
import { SearchCheck } from "lucide-react";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";

import ContenedorVisorDetalleVenta from "./ContenedorVisorDetalleVenta";
import { Card } from "../../../../../components/organismos/Card";
import {
  RenderActionsVentas,
  RenderActionsVentasTodas,
} from "../../../../../components/tablaComponentes/RenderBotonesActions";

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
            dni: venta.dniCliente,
            metodoPago: venta.metodoPago,
            fecha: fecha,
            monto: formateoMoneda.format(venta.total),
          };
        }),
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
          <Card>
            <Table
              styleTable={"cursor-pointer w-full"}
              columnas={columnasVentasTodas}
              arrayBody={newArray.sort((a, b) => a.fechaVenta > b.fechaVenta)}
              onClickRegistro={selectRegistro}
              renderBotonActions={RenderActionsVentasTodas}
            />
          </Card>
        )}
      </div>
      <div className="md:flex items-center justify-center gap-2 w-1/3 hidden sticky top-0">
        <Card>
          <ContenedorVisorDetalleVenta ventaId={seleccionador?.id} />
        </Card>
      </div>
    </div>
  );
}
