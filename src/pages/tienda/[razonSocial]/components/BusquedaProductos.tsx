import { PlusCircle, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { tiendaStore } from '../../../../context/store';
import useBusquedaFiltros from '../../../../hook/useBusquedaFiltro';

export default function BusquedaProductos() {
  const { data, loading } = useStore(tiendaStore);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const { encontrado, handleSearch, setSearch, search } = useBusquedaFiltros(
    data?.productos,
    ['descripcion', 'categoria']
  );
  useEffect(() => {
    if (data?.productos) {
      setProductosOriginales(data.productos);
    }
  }, [loading]);

  // 🔁 Cuando cambia el resultado de búsqueda
  useEffect(() => {
    tiendaStore.set({
      ...tiendaStore.get(),
      data: { ...data, productos: encontrado },
    });

    // 🔄 Si no se encuentra nada, buscar remotamente
    if (search && encontrado.length === 0) {
      fetchProductosRemotos(search);
    }
    // 🔁 Si se limpia la búsqueda, restaurar los productos originales
    if (search === '') {
      tiendaStore.set({
        ...tiendaStore.get(),
        data: { ...data, productos: productosOriginales },
      });
    }
  }, [encontrado, search]);

  // 🛰️ Consulta a base de datos
  const fetchProductosRemotos = async (termino: string) => {
    try {
      const res = await fetch(`/api/productos/productos?search=${termino}`, {
        method: 'GET',
        headers: {
          'xx-user-id': data?.empresa?.id,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const productos = await res.json();

      tiendaStore.set({
        ...tiendaStore.get(),
        data: { ...data, productos: productos },
      });
    } catch (err) {
      console.error('Error buscando productos remotos:', err);
    }
  };

  return (
    <div className="flex items-center">
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Buscar producto..."
          className="w-full text-sm focus:shadow-lg focus:shadow-primary-100/30 py-1 px-2 border duration-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-100"
        />
        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}
