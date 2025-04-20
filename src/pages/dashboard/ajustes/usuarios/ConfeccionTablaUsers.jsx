import React, { useEffect, useState } from "react";
import Table from "../../../../components/tablaComponentes/Table";
import { columnasUsuarios } from "../../../../utils/columnasTables";
import { RenderActionsUsers } from "../../../../components/tablaComponentes/RenderBotonesActions";
import { useStore } from "@nanostores/react";
import { fetchRolesData, rolesStore } from "../../../../context/store";

export default function ConfeccionTablaUsers({ userId }) {
  const [newArray, setNewArray] = useState([]);

  const { data, loading, error } = useStore(rolesStore);

  useEffect(() => {
    // Fetch roles data when component mounts
    fetchRolesData(userId);
  }, []); // Dependencia para refetch si cambia el userId

  useEffect(() => {
    // Transformar datos cuando la data cambie
    if (data && data.userDB) {
      const transformedArray = data.userDB.map((cliente, i) => ({
        id: cliente.id,
        N: i + 1,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        rol: cliente.rol,
        // Añade otros campos según necesites
      }));

      setNewArray(transformedArray);
    }
  }, [loading])

  // Manejo de errores
  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error al cargar usuarios: {error}
      </div>
    );
  }
  return (
    <div className="w-full">
      {loading ? (
        <div
          colSpan={"2"}
          className="border-b last:border-0 text-xs font-semibold animate-pulse bg-white text-center p-4"
        >
          Cargando...
        </div>
      ) : (
        <Table
          arrayBody={newArray}
          columnas={columnasUsuarios}
          renderBotonActions={RenderActionsUsers}
        />
      )}
    </div>
  );
}
