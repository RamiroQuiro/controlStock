import React from 'react';
import Table from '../tablaComponentes/Table';
import { columnsUltimasTransacciones } from '../../utils/columnasTables';
import formatDate from '../../utils/formatDate';
import { LockOpen, Printer, SearchCheck, View } from 'lucide-react';
import { formateoMoneda } from '../../utils/formateoMoneda';

interface Transaccion {
  id: string;
  cliente: string;
  fecha: string;
  monto: number;
  metodoPago: string;
}

const UltimasTransacciones: React.FC = ({arrayTransacciones}) => {
  const transacciones: Transaccion[] = [
    {
      idVenta: "VTA-1234",
      cliente: "Juan Pérez",
      fecha: "2023-11-15 14:30",
      monto: 12500,
      estado: "completada",
      metodoPago: "Efectivo"
    },
    {
      idVenta: "VTA-1235",
      cliente: "María González",
      fecha: "2023-11-15 12:45",
      monto: 8750,
      estado: "completada",
      metodoPago: "Tarjeta de Crédito"
    },
    {
      idVenta: "VTA-1236",
      cliente: "Carlos Rodríguez",
      fecha: "2023-11-15 11:20",
      monto: 15000,
      estado: "pendiente",
      metodoPago: "Transferencia"
    },
    {
      idVenta: "VTA-1237",
      cliente: "Ana Martínez",
      fecha: "2023-11-15 10:15",
      monto: 5200,
      estado: "completada",
      metodoPago: "Efectivo"
    },
    {
      idVenta: "VTA-1238",
      cliente: "Roberto López",
      fecha: "2023-11-14 16:50",
      monto: 9800,
      estado: "cancelada",
      metodoPago: "Tarjeta de Débito"
    }
  ];

  const newArray=arrayTransacciones.map((venta)=>{

    return{
      ...venta,
      fecha:formatDate(venta.fecha),
      total:formateoMoneda.format(venta.total),
      idVenta:`...${(venta.idVenta).slice(6,-1)}`,
      acciones:<div className='flex items-center justify-center gap-2 w-full'>
      <button id="impresionVenta" className='bg-primary-bg-componentes relative rounded-full group py-0.5 px-1'> <span className='absolute left-1/2 -translate-x-1/2 bottom-[103%] bg-primary-textoTitle/90 px-1 py-0.5 w-16 text-xs text-white hidden group-hover:flex items-center justify-center animate-aparecer'>imprimir</span><Printer className='w-5 stroke-slate-500'/></button>
      <button id="verVenta" onClick={()=>window.location.href=`/dashboard/ventas/${venta.idVenta}`} className='bg-primary-bg-componentes relative rounded-full group py-0.5 px-1'> <span className='absolute left-1/2 -translate-x-1/2 bottom-[103%] bg-primary-textoTitle/90 px-1 py-0.5 w-16 text-xs text-white hidden group-hover:flex items-center  justify-center animate-aparecer'>ver oper...</span><SearchCheck className='stroke-green-500 w-5 '/></button></div>
    }
  })
  const getEstadoClase = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Últimas Transacciones</h2>
        <button className="text-primary-100 text-sm font-medium hover:underline">
          Ver todas
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <Table arrayBody={newArray} columnas={columnsUltimasTransacciones}/>
    
      </div>
    </div>
  );
};

export default UltimasTransacciones;