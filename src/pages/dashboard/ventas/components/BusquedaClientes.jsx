import React, { useState } from 'react';
import { armandoNewArray } from '../../../../utils/newArrayTable';
import { clienteColumns } from '../../../../utils/columnasTables';
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx';
import { SearchCode } from 'lucide-react';
import Table from '../../../../components/tablaComponentes/Table';
import { useQuery } from '@tanstack/react-query';

export default function BusquedaClientes({ onClose, setCliente, empresaId }) {
  const [inputBusqueda, setInputBusqueda] = useState('');

  const handleChange = (e) => {
    e.preventDefault();
    setInputBusqueda(e.target.value);
  };

  const { data: clientesEncontrados = [], isFetching } = useQuery({
    queryKey: ['busquedaClientes', inputBusqueda, empresaId],
    queryFn: async () => {
      if (inputBusqueda.length < 3) return [];
      const responseFetch = await fetch(
        `/api/clientes/buscarCliente?search=${inputBusqueda}`,
        {
          method: 'GET',
          headers: {
            'xx-empresa-id': String(empresaId),
          },
        }
      );
      const data = await responseFetch.json();
      if (data.status === 200) {
        return data.data || [];
      }
      return [];
    },
    enabled: inputBusqueda.length >= 3,
    staleTime: 1000 * 60 * 5,
  });

  const newArray = armandoNewArray(clientesEncontrados, [
    'nombre',
    'dni',
    'email',
    'celular',
  ]);

  const clickRegistro = (e) => {
    onClose(false);
    setCliente(e);
  };

  return (
    <div className="flex flex-col items-start justify-normal w-full h-full p-5">
      <h2 className="text-3xl font-semibold mb-3">Busqueda de clientes</h2>
      <div className="w-full my-3 inline-flex gap-3">
        <InputComponenteJsx
          tab={1}
          name={'cliente'}
          type={'search'}
          placeholder={'Escriba nombre o DNI (min. 3 letras)...'}
          handleChange={handleChange}
        />
        <div className="flex items-center justify-center px-2 w-10 py-0.5">
          {isFetching ? (
            <div className="animate-spin border-4 border-primary-100 border-t-transparent rounded-full w-6 h-6" />
          ) : (
            <SearchCode className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>

      <Table
        arrayBody={newArray}
        onClickRegistro={clickRegistro}
        columnas={clienteColumns}
      />
    </div>
  );
}
