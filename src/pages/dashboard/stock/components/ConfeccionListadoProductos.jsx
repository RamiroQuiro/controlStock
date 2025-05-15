
import React, { useEffect, useState } from "react";
import CardProductosStock from "./CardProductosStock";
import { useStore } from "@nanostores/react";
import { busqueda, stockStore } from "../../../../context/store";
import SkeletorCarProductos from "./SkeletorCarProductos";

const ConfeccionListadoProductos = () => {
  // Obtenemos el estado del store
  const {data,loading} = useStore(stockStore);
  const busquedaValue = useStore(busqueda);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

console.log('data',data)
  return (
    <div className="flex w-full flex-col gap-1">
     {!loading? data?.listaProductos?.length > 0 ? (
        data?.listaProductos.map((producto) => (
          <CardProductosStock key={producto.id} prod={producto} />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      )
    :
    [0,1,2,3,4].map((_,i)=>(
      <SkeletorCarProductos key={i}/>
    ))
    }
    </div>
  );
};

export default ConfeccionListadoProductos;
