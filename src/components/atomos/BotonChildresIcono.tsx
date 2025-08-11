import type { IconNode } from 'lucide-react';
interface Props {
  className?: string;
  handleClick?: () => void;
  icono: IconNode;
  children: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function BotonChildresIcono({
  className,
  handleClick,
  icono,
  disabled,
  children,
  type,
}: Props) {
  const onClick = () => {
    handleClick?.();
  };
  const Icono = icono;
  return (  
    <button
    disabled={disabled}
    type={type}
      onClick={onClick}
      className={`${className} disabled:bg-gray-200 disabled:text-stone-600 disabled:border-opacity-0 disabled:hover:text-stone-600  flex items-center  gap-1 md:px-3 px-2 md:py-2 py-1  rounded-md  transition-colors`}
    >
      <Icono className="w-6 h-6" />
      {children}
    </button>
  );
}
