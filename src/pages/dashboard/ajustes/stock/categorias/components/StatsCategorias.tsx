import React from 'react';
import { useStore } from '@nanostores/react';
import { categoriasStore } from '../../../../../../context/store';
import DivReact from '../../../../../../components/atomos/DivReact';


export default function StatsCategorias() {
  const { data, loading } = useStore(categoriasStore);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 w-full my-5 md:grid-cols-4 gap-4">
        <DivReact className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-300">...</div>
          <div className="text-sm font-semibold text-gray-400">Cargando...</div>
        </DivReact>
        <DivReact className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-300">...</div>
          <div className="text-sm font-semibold text-gray-400">Cargando...</div>
        </DivReact>
        <DivReact className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-300">...</div>
          <div className="text-sm font-semibold text-gray-400">Cargando...</div>
        </DivReact>
        <DivReact className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-300">...</div>
          <div className="text-sm font-semibold text-gray-400">Cargando...</div>
        </DivReact>
      </div>
    );
  }

  const totalCategorias = data.length;
  const categoriasActivas = data.filter((cat: any) => cat.activo).length;
  const totalProductos = data.reduce((sum: number, cat: any) => sum + (cat.cantidadProductos || 0), 0);
  const promedioPorCategoria = totalCategorias > 0 ? (totalProductos / totalCategorias).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 w-full my-5 md:grid-cols-4 gap-4">
      <DivReact className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-blue-600">{totalCategorias}</div>
        <div className="text-sm font-semibold text-gray-600">Total Categorías</div>
      </DivReact>
      <DivReact className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-green-600">{categoriasActivas}</div>
        <div className="text-sm font-semibold text-gray-600">Activas</div>
      </DivReact>
      <DivReact className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-neutral-600">{totalProductos}</div>
        <div className="text-sm font-semibold text-gray-600">Total Productos</div>
      </DivReact>
      <DivReact className="bg-white p-4 rounded-lg shadow">
        <div className="text-2xl font-bold text-purple-600">{promedioPorCategoria}</div>
        <div className="text-sm font-semibold text-gray-600">Promedio por Categoría</div>
      </DivReact>
    </div>
  );
}
