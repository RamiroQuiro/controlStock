import { useStore } from '@nanostores/react';
import React, { useEffect, useState } from 'react';
import { categoriasStore } from '../../../../../context/store';
import CategoriasCard from '../../components/CategoriasCard';

type Props = {};

export default function ListarCardCategorias({}: Props) {
  const [categorias, setCategorias] = useState([]);
  const { data, loading, error } = useStore(categoriasStore);
  useEffect(() => {
    if (!data) return;

    setCategorias(data);
  }, [loading]);

  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categorias?.map((category) => (
        <CategoriasCard item={category} type="categoria" />
      ))}
    </div>
  );
}
