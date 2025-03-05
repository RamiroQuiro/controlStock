import React from "react";
import Table from "../../../components/tablaComponentes/Table";
import { clienteColumns } from "../../../utils/columnasTables";
import { RenderActionsClientes } from "../../../components/tablaComponentes/RenderBotonesActions";

const columns = [
  {
    header: "Nombre",
    accessorKey: "nombre",
  },
  {
    header: "DNI",
    accessorKey: "dni",
  },
  {
    header: "Teléfono",
    accessorKey: "telefono",
  },
  {
    header: "Categoría",
    accessorKey: "categoria",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.original.categoria === "VIP"
            ? "bg-purple-100 text-purple-800"
            : row.original.categoria === "regular"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
        }`}
      >
        {row.original.categoria}
      </span>
    ),
  },
  {
    header: "Estado",
    accessorKey: "estado",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.original.estado === "activo"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {row.original.estado}
      </span>
    ),
  },
  {
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button
          onClick={() => handleVerPerfil(row.original.id)}
          className="text-blue-600 hover:text-blue-800"
        >
          Ver perfil
        </button>
        <button
          onClick={() => handleEliminar(row.original.id)}
          className="text-red-600 hover:text-red-800"
        >
          Eliminar
        </button>
      </div>
    ),
  },
];

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
        renderBotonActions={RenderActionsClientes}
        columnas={clienteColumns}
        arrayBody={newArray}
      />
    </div>
  );
}
