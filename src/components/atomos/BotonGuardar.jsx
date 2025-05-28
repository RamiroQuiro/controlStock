import React, { Children } from 'react';

export default function BotonGuardar({ children, id, type, className }) {
  return (
    <button
      id={id}
      type={type}
      className={`bg-primary-100 px-4 text-white py-3 rounded-lg font-semibold md:tracking-normal tracking-tighter active:ring-2 border-primary-texto/20 hover:ring-2 hover:ring-primary-100/50 md:ring-0 ring-primary-100 duration-200 text-xs border uppercase hover:bg-primario-100/50 hover:text-primary-textoTitle ${className}`}
    >
      {children}
    </button>
  );
}
