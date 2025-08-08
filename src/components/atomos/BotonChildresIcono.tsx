import type { IconNode } from 'lucide-react';
interface Props {
  className?: string;
  handleClick?: () => void;
  icono: IconNode;
  children: string;
}

export default function BotonChildresIcono({
  className,
  handleClick,
  icono,
  children,
}: Props) {
  const onClick = () => {
    handleClick?.();
  };
  return (
    <button
      onClick={onClick}
      className={`${className} flex items-center md:gap-2 gap-1 md:px-3 px-2 md:py-2 py-1  rounded-md  transition-colors`}
    >
      <icono className="w-4 h-4" />
      {children}
    </button>
  );
}
