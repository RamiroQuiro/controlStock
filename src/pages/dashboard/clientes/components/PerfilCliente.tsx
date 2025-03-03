import { useState, useEffect } from 'react';
import { formateoMoneda } from '../../../../utils/formateoMoneda';
import EstadisticasCliente from './EstadisticasCliente';
import DivReact from '../../../../components/atomos/DivReact';
import HistorialCompras from './HistorialCompras';
import DetalleCliente from './DetalleCliente';
import ContenedorEstadisticaCliente from './ContenedorEstadisticaCliente';

interface Cliente {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria: string;
  estado: string;
  limiteCredito: number;
  saldoPendiente: number;
  observaciones: string;
  fechaAlta: number;
  ultimaCompra: number;
}

interface Compra {
  id: string;
  fecha: number;
  total: number;
  estado: string;
}

export default function PerfilCliente({ cliente }: { cliente: Cliente }) {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalGastado: 0,
    promedioCompra: 0,
    frecuenciaCompra: 0
  });

  useEffect(() => {
    cargarHistorialCompras();
  }, []);

  const cargarHistorialCompras = async () => {
    try {
      const response = await fetch(`/api/clientes/${cliente.id}/compras`);
      const data = await response.json();
      setCompras(data.compras);
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-normal gap-3">
      <div className='flex md:flex-row flex-col items-stretch justify-between w-full gap-3'>
        
      
      {/* Información Principal */}
     <DetalleCliente cliente={cliente}/>

      {/* Estadísticas */}
     <ContenedorEstadisticaCliente estadisticas={estadisticas}/>
      </div>
      {/* Historial de Compras */}
     <HistorialCompras compras={compras}/>
    </div>
  );
} 