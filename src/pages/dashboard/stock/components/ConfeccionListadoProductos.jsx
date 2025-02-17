import React, { useEffect, useState } from "react";
import CardProductosStock from "./CardProductosStock";
import { useStore } from "@nanostores/react";
import { busqueda } from "../../../../context/store";

export default function ConfeccionListadoProductos({ productosArray }) {
  const [filtradoProducto, setFiltradoProducto] = useState(productosArray);
  const $productos = useStore(busqueda).productosBuscados;
console.log('productos filtrados ->',$productos,'productos array ->',productosArray)
  useEffect(() => {
    if ($productos === null) {
      setFiltradoProducto(productosArray); // ✅ Muestra todos si no hay búsqueda
    } else {
      setFiltradoProducto($productos); // ✅ Si hay resultados, se muestran
    }
  }, [$productos, productosArray]);

  return (
    <div className="w-full space-y-1.5">
      {filtradoProducto && filtradoProducto.length > 0 ? (
        filtradoProducto.map((prod, i) => (
          <CardProductosStock prod={prod} key={i} />
        ))
      ) : (
        <p className="text-gray-500">No se encontraron productos</p>
      )}
    </div>
  );
}
