import React from "react";
import Table from "../../../components/tablaComponentes/Table";
import { clienteColumns } from "../../../utils/columnasTables";
import { RenderActionsClientes, RenderActionsProveedores } from "../../../components/tablaComponentes/RenderBotonesActions";



export default function ConfeccionTabla({ data }) {
  const newArray = data.map((cliente, i) => {
    return {
      id: cliente.id,
      N: i + 1,
      nombre: cliente.nombre,
      dni: cliente.dni,
      email: cliente.email,
      celular: cliente.celular,
      estado: (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            cliente.estado === "activo"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {cliente.estado}
        </span>
      ),
    };
  });
  return (
    <div className="w-full">
      <Table
        renderBotonActions={RenderActionsProveedores}
        columnas={clienteColumns}
        arrayBody={newArray}
      />
    </div>
  );
}
