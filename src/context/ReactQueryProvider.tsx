import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

// Proveedor global para que las islas de React puedan compartir la Caché de TanStack
export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Inicializamos el cliente una sola vez por render/aislamiento
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos de validez por defecto antes de refetching en background
        refetchOnWindowFocus: false, // Quitarle carga al servidor para que no refetchee cada vez que tabulas
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
