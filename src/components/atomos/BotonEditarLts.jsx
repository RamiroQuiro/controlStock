import { Edit, Pencil } from 'lucide-react';
import BotonChildresIcono from './BotonChildresIcono';

export default function BotonEditar({ handleClick, disable }) {
  return (
    <BotonChildresIcono
      children="Editar"
      handleClick={handleClick}
      icono={Edit}
      className={`bg-blue-400 hover:bg-blue-500 text-white`}
    >
      Actualizar
    </BotonChildresIcono>
  );
}
