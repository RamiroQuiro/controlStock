import React, { useEffect, useState } from "react";
import CardProductosStock from "./CardProductosStock";import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { busqueda, stockStore } from "../../../../context/store";
import { cache } from "../../../../utils/cache";

export default function ConfeccionListadoProductos() {
  const [productosArray, setProductosArray] = useState([]);
  const [filtradoProducto, setFiltradoProducto] = useState([]);
  const $productos = useStore(busqueda).productosBuscados;
  const {data, loading} = useStore(stockStore);

  useEffect(() => {
    const loadData = async () => {
      // Primero intenta del caché
      const cachedData = await cache.get('useStore->');
      
      if (cachedData && !loading) {
        // Si hay caché y no está cargando, usa caché
        setProductosArray(cachedData.listaProductos);
      } else if (data && !loading) {
        // Si no hay caché, usa store y guarda en caché
        setProductosArray(data.listaProductos);
        await cache.set('useStore->', data, 120); // Caché por 2 minutos
      }

      // Lógica de filtrado
      if ($productos === null) {
        setFiltradoProducto(productosArray);
      } else {
        setFiltradoProducto($productos);
      }
    };

    loadData();
  }, [data, loading, $productos]);

  return (
    <div className="w-full space-y-1.5">
      {filtradoProducto?.length > 0 ? (
        filtradoProducto.map((prod, i) => (
          <CardProductosStock prod={prod} key={i} />
        ))
      ) : (
        <p className="text-gray-500">No se encontraron productos</p>
      )}
    </div>
  );
}
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
