import React from 'react';
import ItemsCategorias from './ItemsCategorias';
import { tiendaStore } from '../../../../../context/store';
import { useStore } from '@nanostores/react';
import BusquedaProductos from '../BusquedaProductos';

export default function SidebarProductos() {
  const { data } = useStore(tiendaStore);
  return (
    <div className="flex flex-col items-start justify-normal gap-2">
      <div className=" md:w-[230px] rounded-r-md md:min-w-[230px] w-full md:py-10 px-3  bg-white sticky top-[68px] md:h-[90vh] h-14 overflow-hidden duration-700 hover:h-max md:hover:h-[90vh] border flex-col flex">
        <div className="flex flex-col w-full  text-gray-500">
        <BusquedaProductos />
        </div>
        <ul className="flex flex-col w-full  text-gray-500 gap-y-2 mt-5">
          {data?.categorias?.map((item, i) => {
            return (
              <ItemsCategorias
                key={i}
                name={item.nombre}
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
