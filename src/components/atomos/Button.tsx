import * as React from "react";
import { cn } from "../../lib/cn";

// Definimos las variantes que el botón puede tener
const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-thin transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-fit disabled:opacity-50 disabled:cursor-not-allowed duration-200",
  variants: {
    variant: {
      primary:
        "bg-primary-100 text-white hover:bg-primary-100/90 focus:ring-primary-100",
      secondary:
        "bg-primary-200 text-white hover:bg-primary-200/90 focus:ring-primary-200",
      tertiary:
        "bg-primary-300  text-white hover:bg-primary-300/90 focus:ring-primary-300",
      blanco:
        "bg-white text-primary-800 hover:bg-primary-150 hover:text-white focus:ring-primary-150 border-primary-150/50",
      cancel: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-600",
      outline:
        "bg-transparent border border-gray-300/50 text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
      downloadPDF:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600",
      grisOscuro:
        "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-700",
      grisClaro:
        "bg-gray-200 text-white hover:bg-gray-300 border border-gray-300/50 text-primary-textoTitle focus:ring-gray-400",
      // Estilo copiado de BotonIndigo.tsx
      indigo:
        "border border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
      // Nuevo estilo para iconos/texto
      bgTransparent:
        "bg-transparent border border-gray-300/50 hover:bg-gray-200/50 hover:border-gray-300 rounded-lg",
      blue: "text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600",
      green: "text-white bg-green-500 hover:bg-green-600 focus:ring-green-600",
    },
    size: {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md",
      lg: "h-11 px-8 rounded-md",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
};

// Definimos las props del componente para que TypeScript nos ayude
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variants.variant;
  size?: keyof typeof buttonVariants.variants.size;
  href?: string;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, href, ...props }, ref) => {
    // Usamos `cn` para construir las clases finales
    const variantClasses = (buttonVariants.variants.variant as any)[variant || "primary"];
    const sizeClasses = (buttonVariants.variants.size as any)[size || "default"];

    const finalClassName = cn(
      buttonVariants.base,
      variantClasses,
      sizeClasses,
      className,
    );

    const isDisabled = props.disabled || loading;

    return href ? (
      <a 
        href={isDisabled ? undefined : href} 
        className={cn(finalClassName, isDisabled && "pointer-events-none opacity-50")} 
        {...props} 
      />
    ) : (
      <button 
        className={finalClassName} 
        ref={ref} 
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {props.children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
export { Button, buttonVariants };
