import React, { useEffect, useState } from "react";
import Table from "../../../components/tablaComponentes/Table";
import { clienteColumns } from "../../../utils/columnasTables";
import { RenderActionsClientes } from "../../../components/tablaComponentes/RenderBotonesActions";

export default function ConfeccionTabla({ userId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [newArray, setNewArray] = useState([]);
  useEffect(() => {
    const fetchCliente = async () => {
      const res = await fetch("/api/clientes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "xx-user-id": userId,
        },
      });
      const data = await res.json();
      setNewArray(
        data?.data?.map((cliente, i) => {
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
        })
      );
      setIsLoading(false);
    };
    fetchCliente();
  }, [isLoading]);

  return (
    <div className="w-full">
      {isLoading ? (
        <div
          colSpan={"2"}
          className="border-b last:border-0 text-xs font-semibold animate-pulse bg-white text-center p-4"
        >
          Cargando...
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table
            renderBotonActions={RenderActionsClientes}
            columnas={clienteColumns}
            arrayBody={newArray}
          />
        </div>
      )}
    </div>
  );
}
