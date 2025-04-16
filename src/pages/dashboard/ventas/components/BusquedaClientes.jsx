import React, { useState } from "react";
import Table from "../../../../components/tablaComponentes/Table";
import { armandoNewArray } from "../../../../utils/newArrayTable";
import { clienteColumns } from "../../../../utils/columnasTables";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import { SearchCode } from "lucide-react";
import { showToast } from "../../../../utils/toast/toastShow";
import { loader } from "../../../../utils/loader/showLoader";

export default function BusquedaClientes({ onClose, setCliente, userId }) {
  const [clientesEncontrados, setClientesEncontrados] = useState([]);
  const [inputBusqueda, setInputBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);

  const handleChange = (e) => {
    e.preventDefault();
    setInputBusqueda(e.target.value);
  };

  const handleCliente = async (e) => {
    loader(true)
    if (inputBusqueda.trim() === "") {
      setResultados([]); // Resetea resultados si el input está vacío
      return;
    }

    if (inputBusqueda.length >= 3) {
      try {
        const responseFetch = await fetch(
          `/api/clientes/buscarCliente?search=${inputBusqueda}`,{
            method:'GET',
            headers:{
              'xx-user-id': userId,
            }
          }
        );
        const data = await responseFetch.json();

        if (data.status === 200) {

          setClientesEncontrados(data.data); // Suponiendo que `data.clientes` es un array
          loader(false)
        } else {
          setResultados([]);
          loader(false)
          showToast(data.msg, { background: "bg-primary-400" });
        }
        loader(false)
      } catch (error) {
        console.error("Error en la búsqueda de clientes:", error);
        loader(false)
        setResultados([]);
        showToast("Error al buscar clientes", { background: "bg-red-500" });
      }
    }
  };

  const newArray = armandoNewArray(clientesEncontrados, [
    "nombre",
    "dni",
    "email",
    "celular",
  ]);

  const clickRegistro = (e) => {
    console.log(e);
    onClose(false);
    setCliente(e);
  };

  return (
    <div className="flex flex-col  items-start justify-normal w-full h-full p-5">
      <h2 className="text-3xl font-semibold mb-">Busqueda de clientes</h2>
      <div className="w-full my-3 inline-flex gap-3">
        <InputComponenteJsx
          tab={1}
          name={"cliente"}
          type={"search"}
          placeholder={"Buscar cliente..."}
          handleChange={handleChange}
        />
        <button
          tabIndex={2}
          onClick={handleCliente}
          id={"btnBusquedaCliente"}
          className="bg-gray-400 focus:border-primary-100/50 border focus:ring text-white flex items-center justify-center px-2 w-10 py-0.5 rounded-full hover:bg-primary-100/80 duration-150"
        >
          <SearchCode className="w-6 h-6" />
        </button>
      </div>

      <Table
        arrayBody={newArray}
        onClickRegistro={clickRegistro}
        columnas={clienteColumns}
      />
    </div>
  );
}
