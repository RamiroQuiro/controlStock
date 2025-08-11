import type { IconNode } from 'lucide-react';
interface Props {
  className?: string;
  handleClick?: () => void;
  icono: IconNode;
  children: string;
    type?: string;
}

export default function BotonChildresIcono({
  className,
  handleClick,
  icono,
  children,
  type,
}: Props) {
  const onClick = () => {
    handleClick?.();
  };
  const Icono = icono;
  return (  
    <button
    type={type}
      onClick={onClick}
      className={`${className}  flex items-center  gap-1 md:px-3 px-2 md:py-2 py-1  rounded-md  transition-colors`}
    >
      <Icono className="w-6 h-6" />
      {children}
    </button>
  );
}
