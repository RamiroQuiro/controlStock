import { useStore } from '@nanostores/react';
import React from 'react';

export default function Button3({
  children,
  disabled,
  className,
  isActive,
  id,
  onClick,
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`${className} 'bg-transparent hover:-primary-texto/10 :text-primary-texto hover:shadow border-primary-100' px-3 py-1 rounded-lg font-semibold capitalize duration-300 text-xs  border disabled:bg-gray-200 disabled:text-stone-600 disabled:border-opacity-0 disabled:hover:text-stone-600 `}
    >
      {children}
    </button>
  );
}
