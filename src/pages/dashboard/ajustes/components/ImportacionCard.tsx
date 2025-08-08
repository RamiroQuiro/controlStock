import React from 'react';
import DivReact from '../../../../components/atomos/DivReact';

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

// Pequeño componente para las tarjetas para no repetir código
export const ImportacionCard = ({ title, description, children }: Props) => {
  return (
    <DivReact>
      <h3 className="text-lg font-semibold text-primary-textoTitle mb-2">
        {title}
      </h3>
      <p className="text-gray-400 text-sm mb-6 flex-grow">{description}</p>
      {children}
    </DivReact>
  );
};
