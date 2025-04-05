import React, { useEffect, useState } from "react";
import CardProductosStock from "./CardProductosStock";
import { useStore } from "@nanostores/react";
import { busqueda, stockStore } from "../../../../context/store";
import { cache } from "../../../../utils/cache";

export default function ConfeccionListadoProductos({ }) {
  const [filtradoProducto, setFiltradoProducto] = useState(productosArray);
  const $productos = useStore(busqueda).productosBuscados;
const [productosArray, setProductosArray] = useState([])
  const {data,loading} = useStore(stockStore);
  useEffect(() => {
    if(loading){
      return;
    }
    setProductosArray(data.listaProductos)
    cache.set('useStore->', data);
    if ($productos === null) {
      setFiltradoProducto(productosArray); // ✅ Muestra todos si no hay búsqueda
    } else {
      setFiltradoProducto($productos); // ✅ Si hay resultados, se muestran
    }
  }, [$productos, loading, data]);

  return (
    <div className="w-full space-y-1.5">
      {filtradoProducto && filtradoProducto.length > 0 ? (
        filtradoProducto?.map((prod, i) => (
          <CardProductosStock prod={prod} key={i} />
        ))
      ) : (
        <p className="text-gray-500">No se encontraron productos</p>
      )}
    </div>
  );
}
