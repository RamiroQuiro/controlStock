import React, { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { tiendaStore, fetchTiendaData } from "../../../../../context/store";

export default function TiendaModernaDataProvider({ empresaId, children }: { empresaId: string, children: (data: any) => React.ReactNode }) {
  const { data, loading, error } = useStore(tiendaStore);

  useEffect(() => {
    if (empresaId) {
      fetchTiendaData(empresaId);
    }
  }, [empresaId]);

  if (loading) return <div>Cargando tienda...</div>;
  if (!data) return <div>Error cargando tienda</div>;

  return <>{children(data)}</>;
}