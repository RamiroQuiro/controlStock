import { useStore } from "@nanostores/react";
import FormularioDeBusqueda from "../organismos/FormularioDeBusqueda";
import { filtroBusqueda, stockStore } from "../../context/store";
import { useEffect, useState } from "react";
import SelectorProveedoresClientes from "./SelectorProveedoresClientes";
import SelectorProductos from "./SelectorProductos";
import { showToast } from "../../utils/toast/toastShow";

export default function FormularioIngresoEgreso({ userId }) {
  const { data, loading, error: errorStorage } = useStore(stockStore);
  
  // Extraer datos del store
  const proveedoresData = data?.data?.dataDb?.proveedoresData || [];
  const clientesData = data?.data?.dataDb?.clientesData || [];
  const listaProductos = data?.data?.dataDb?.listaProductos || [];

  const [formulario, setFormulario] = useState({
    productoId: "",
    fecha: Date.now(),
    motivo: "",
    cantidad: "",
    observaciones: "",
    tipo: "ingreso",
  });

  // ...resto del código existente...

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (errorStorage) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar los datos: {errorStorage}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-1 p-6 w-full text-sm rounded-lg">
      <form>
        {/* Selector de productos */}
        <SelectorProductos
          listaProductos={listaProductos}
          productoSelect={productoSelect}
          key={0}
        />

        {/* Selector de proveedor/cliente */}
        <SelectorProveedoresClientes
          proveedoresData={proveedoresData}
          clientesData={clientesData}
          dataSelect={dataSelect}
          formulario={formulario}
        />

        {/* ...resto del JSX existente... */}
      </form>
    </div>
  );
}