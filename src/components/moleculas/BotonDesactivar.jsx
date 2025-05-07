import { Pause, CheckCircle } from 'lucide-react';

export default function BotonDesactivar({
  id,
  handleClick,
  className,
  classNameIcon,
  activo,
}) {
  return (
    <button
      id={id}
      onClick={handleClick}
      className={`flex items-center px-1 py-0.5 rounded transition-colors duration-150
        ${
          activo == 'inactivo'
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' // Suspender
            : 'bg-green-600 hover:bg-green-700 text-white' // Activar
        }
        ${className || ''}
      `}
      title={activo == 'inactivo' ? 'Suspender usuario' : 'Activar usuario'}
    >
      {activo === 'inactivo' ? (
        <Pause className={`w-5 h-5 ${classNameIcon || ''}`} />
      ) : (
        <CheckCircle className={`w-5 h-5 ${classNameIcon || ''}`} />
      )}
    </button>
  );
}
