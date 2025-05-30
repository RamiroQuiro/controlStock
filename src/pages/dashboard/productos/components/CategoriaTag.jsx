import React from 'react';
import { CircleX } from 'lucide-react';

// Componente para cada tag de categoría seleccionada
export const CategoriaTag = ({ categoria, onRemove }) => (
  <span className="inline-flex items-center justify-center text-xs px-1 text-primary-texto py-0.5 rounded-lg border bg-primary-100/20">
    {categoria.nombre}
    <CircleX
      className="rounded-full bg-primary-400 ml-2 cursor-pointer text-white px-1 text-center active:-scale-95"
      onClick={() => onRemove(categoria.id)}
    />
  </span>
);
