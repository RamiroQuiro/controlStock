import React, { useEffect, useState } from "react";
import ItemsCategorias from "./ItemsCategorias";
import { tiendaStore } from "../../../../../context/store";
import { useStore } from "@nanostores/react";
import BusquedaProductos from "../BusquedaProductos";
import Button3 from "../../../../../components/atomos/Button3";
import Etiquetas from "../../../../../components/atomos/Etiquetas.astro";
import H2 from "../../../../../components/atomos/H2.astro";
import { CircleX } from "lucide-react";
import OdenaientoProductos from "../OdenaientoProductos";

export default function SidebarProductos() {
  const { data, loading } = useStore(tiendaStore);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const categoriasProdcutos = data.productos?.map((item) => item.categorias);
  const categoriasUnicas = categoriasProdcutos?.flat().reduce((acc, cat) => {
    if (!acc.find((item) => item.id === cat.id)) {
      acc.push(cat);
    }
    return acc;
  }, []);

  useEffect(() => {
    if (data?.productos) {
      setProductosOriginales(data.productos);
    }
  }, [loading]);

  const handleCategoriaFilter = (categoriaSeleccionada) => {
    // Filtra productos que tengan la categoría seleccionada
    const productosFiltrados = data.productos?.filter((producto) =>
      producto.categorias?.some((cat) => cat.id === categoriaSeleccionada.id)
    );
    console.log("productosFiltrados", productosFiltrados);
    // Actualiza el store con los productos filtrados
    tiendaStore.set({
      ...tiendaStore.get(),
      data: { ...data, productos: productosFiltrados }, // Puedes guardar en otra propiedad si quieres mantener los productos originales
    });
  };

  return (
    <div className="flex flex-col items-start justify-normal gap-2">
      <div className=" md:w-[230px] rounded-r-md md:min-w-[230px] w-full md:py-5 gap-3 px-3  bg-white sticky top-[68px] md:h-[90vh] h-14 overflow-hidden duration-700 hover:h-max md:hover:h-[90vh] border flex-col flex">
        <div className="flex flex-col w-full  text-gray-500">
          <Button3
            className="flex items-center gap-2"
            onClick={() =>
              tiendaStore.set({
                ...tiendaStore.get(),
                data: { ...data, productos: productosOriginales },
              })
            }
          >
           <CircleX className="w-4 h-4" /> limpiar filtros
          </Button3>
        </div>
        <div className="flex flex-col w-full  text-gray-500 gap-3">
          <BusquedaProductos />
         <OdenaientoProductos />
        </div>
        <ul className="   rounded-lg flex flex-col w-full  text-gray-500 gap-y-2 mt-2">
          <h2 className="px-2 text- font-semibold text-primary-textoTitle"> Categorias</h2>
          {categoriasUnicas?.map((item, i) => {
            return (
              <ItemsCategorias
                key={i}
                name={item.nombre}
                onClick={() => handleCategoriaFilter(item)}
                imgSrc={item.srcPhoto}
                data={item}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
