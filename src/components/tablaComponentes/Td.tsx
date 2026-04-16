import React from 'react'

interface Props {
  children: any;
  estado?: any;
}

export default function Td({ children }: Props) {
  // Manejo de valores booleanos
  if (typeof children === 'boolean') {
    return (
      <td className="px-4 py-3 align-middle">
        <span className={`
          inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] 
          ${children ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        `}>
          {children ? '✓' : '✕'}
        </span>
      </td>
    );
  }

  // Manejo de fechas
  if (children instanceof Date) {
    return (
      <td className="px-4 py-3 align-middle text-sm text-gray-600">
        {children.toLocaleDateString()}
      </td>
    );
  }

  return (
    <td className="px-4 py-4 align-middle text-sm text-gray-700 font-medium">
      {children}
    </td>
  );
}
