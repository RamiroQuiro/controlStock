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
      className={`${className} p-2 rounded-lg bg-neutral-700 text-xs py-2 px-4 text-white border hover:shadow-lg duration-150 hover:bg-primary-texto/80`}
    >
      {children}
    </button>
  );
}
