
import React, { useEffect, useState } from "react";
import CardProductosStock from "./CardProductosStock";
import { useStore } from "@nanostores/react";
import { busqueda, stockStore } from "../../../../context/store";

const ConfeccionListadoProductos = () => {
  // Obtenemos el estado del store
  const {data,loading} = useStore(stockStore);
  const busquedaValue = useStore(busqueda);
  const [productosFiltrados, setProductosFiltrados] = useState([]);


  return (
    <div className="flex w-full flex-col gap-1">
      {data?.listaProductos?.length > 0 ? (
        data?.listaProductos.map((producto) => (
          <CardProductosStock key={producto.id} prod={producto} />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
};

export default ConfeccionListadoProductos;
