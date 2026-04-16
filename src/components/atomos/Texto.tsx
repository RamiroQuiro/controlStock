
import * as React from 'react';
import { cn } from '../../lib/cn';

interface TextoProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
  variant?: 
    | 'h1' 
    | 'h2' 
    | 'h3' 
    | 'title' 
    | 'subtitle' 
    | 'body' 
    | 'small' 
    | 'muted' 
    | 'error' 
    | 'success';
}

const variantsMap = {
  h1: 'text-4xl font-bold text-primary-textoTitle tracking-tight',
  h2: 'text-2xl font-semibold text-primary-textoTitle',
  h3: 'text-xl font-medium text-primary-textoTitle',
  title: 'text-lg font-semibold text-primary-textoTitle',
  subtitle: 'text-base font-medium text-gray-600',
  body: 'text-sm text-primary-texto leading-relaxed',
  small: 'text-xs text-gray-500',
  muted: 'text-sm text-gray-400',
  error: 'text-sm text-red-500 font-medium',
  success: 'text-sm text-emerald-500 font-medium',
};

const Texto = React.forwardRef<HTMLElement, TextoProps>(
  ({ as: Component = 'p', variant = 'body', className, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(variantsMap[variant], className)}
        {...props}
      />
    );
  }
);

Texto.displayName = 'Texto';

export default Texto;
export { Texto };
