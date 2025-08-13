import React from 'react';
import { useStore } from '@nanostores/react';

import ListarCardCategorias from '../ListarCardCategorias';
import SkeletonCategorias from './SkeletonCategorias';
import { categoriasStore } from '../../../../../../context/store';

interface Props {
  skeletonCount: number;
}

export default function CategoriasWrapper({ skeletonCount }: Props) {
  const { data, loading } = useStore(categoriasStore);

  // Si está cargando, mostrar skeleton
  if (loading) {
    return <SkeletonCategorias count={skeletonCount} />;
  }

  // Si no hay datos, mostrar skeleton con 3 elementos por defecto
  if (!data || data.length === 0) {
    return <SkeletonCategorias count={3} />;
  }

  // Si hay datos, mostrar las categorías reales
  return <ListarCardCategorias   />;
}
