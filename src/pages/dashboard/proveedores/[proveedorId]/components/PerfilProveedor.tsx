import { useState, useEffect } from 'react';
import { DetalleProveedor } from './DetalleProveedor';
import { ContenedorEstadisticaProveedor } from './ContenedorEstadisticaProveedor';
import { HistorialComprasProveedor } from './HistorialComprasProveedor';
import type { Proveedor } from '../../../../../types';


interface Compra {
  id: string;
  fecha: number;
  total: number;
  estado: string;
}

export default function PerfilCliente({ proveedor }: { proveedor:Proveedor }) {
  const [comprasProveedor, setComprasProveedor] = useState<Compra[]>([]); 
  const [estadisticas, setEstadisticas] = useState({
    totalGastado: 0,
    promedioCompra: 0,
    frecuenciaCompra: 0,
  });

  useEffect(() => {
    cargarHistorialCompras();
  }, []);

  const cargarHistorialCompras = async () => {
    try {
      const response = await fetch(`/api/proveedores/${proveedor.id}/compras`);
      const data = await response.json();
      setComprasProveedor(data.compras);
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-normal gap-3">
      <div className="flex md:flex-row flex-col items-stretch justify-between w-full gap-3">
        {/* Información Principal */}
        <DetalleProveedor proveedor={proveedor} />

        {/* Estadísticas */}
        <ContenedorEstadisticaProveedor estadisticasProveedor={estadisticas} />
      </div>
      {/* Historial de Compras */}
      <HistorialComprasProveedor comprasProveedor={comprasProveedor} />
    </div>
  );
} 