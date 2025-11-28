import React, { useState } from "react";
import Table from "../../../../components/tablaComponentes/Table";
import { armandoNewArray } from "../../../../utils/newArrayTable";
import { proveedorColumns } from "../../../../utils/columnasTables";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import { SearchCode } from "lucide-react";
import { showToast } from "../../../../utils/toast/toastShow";

export default function BusquedaProveedor({ onClose, setProveedor }) {
  const [proveedoresEncontrados, setProveedoresEncontrados] = useState([]);
  const [inputBusqueda, setInputBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);

  const handleChange = (e) => {
    e.preventDefault();
    setInputBusqueda(e.target.value);
  };

  const handleProveedor = async (e) => {
    e.preventDefault();
    if (inputBusqueda.trim() === "") {
      setResultados([]); // Resetea resultados si el input está vacío
      return;
    }

    if (inputBusqueda.length >= 3) {
      try {
        const responseFetch = await fetch(
          `/api/proveedores/buscarProveedores?search=${inputBusqueda}`
        );
        const data = await responseFetch.json();

        if (data.status === 200) {
          setProveedoresEncontrados(data.data);
        } else {
          setResultados([]);
          showToast(data.msg, { background: "bg-primary-400" });
        }
      } catch (error) {
        console.error("Error en la búsqueda de proveedores:", error);
        setResultados([]);
        showToast("Error al buscar proveedores", { background: "bg-red-500" });
      }
    }
  };

  const newArray = armandoNewArray(proveedoresEncontrados, [
    "id", // 🔧 FIX: Incluir el ID para que se pueda guardar en la compra
    "nombre",
    "ruc",
    "email",
    "telefono",
    "direccion",
  ]);

  const clickRegistro = (e) => {
    console.log("Proveedor seleccionado:", e); // 🔍 DEBUG
    onClose(false);
    setProveedor(e);
  };

  return (
    <div className="flex flex-col items-start justify-normal w-full h-full p-5">
      <h2 className="text-3xl font-semibold mb-">Búsqueda de Proveedores</h2>
      <div className="w-full my-3 inline-flex gap-3">
        <InputComponenteJsx
          tab={1}
          name={"proveedor"}
          type={"search"}
          placeholder={"Buscar proveedor..."}
          handleChange={handleChange}
        />
        <button
          tabIndex={2}
          onClick={handleProveedor}
          id={"btnBusquedaProveedor"}
          className="bg-gray-400 focus:border-primary-100/50 border focus:ring text-white flex items-center justify-center px-2 w-10 py-0.5 rounded-full hover:bg-primary-100/80 duration-150"
        >
          <SearchCode className="w-6 h-6" />
        </button>
      </div>

      <Table
        arrayBody={newArray}
        onClickRegistro={clickRegistro}
        columnas={proveedorColumns}
      />
    </div>
  );
}
