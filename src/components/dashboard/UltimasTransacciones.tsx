import React from 'react';
import Table from '../tablaComponentes/Table';
import { columnsUltimasTransacciones } from '../../utils/columnasTables';
import formatDate from '../../utils/formatDate';
import { LockOpen, Printer, SearchCheck, View } from 'lucide-react';
import { formateoMoneda } from '../../utils/formateoMoneda';
import { useStore } from '@nanostores/react';
import { statsDashStore } from '../../context/store';

interface Transaccion {
  id: string;
  cliente?: string;
  proveedor?: string;
  fecha: string;
  total: number;
  metodoPago: string;
}

const UltimasTransacciones = () => {
  const stats = useStore(statsDashStore) as any;
  let arrayUltimasTransacciones: Transaccion[] =
    stats?.data?.dataDb?.ultimasTransacciones || [];

  const renderActions = (transaccion: any) => (
    <div className="flex items-center justify-end gap-2 pr-2">
      <button
        id="impresionVenta"
        className="bg-primary-bg-componentes relative rounded-full group py-0.5 px-1 hover:bg-gray-100 transition-colors"
        title="Imprimir"
      >
        <Printer className="w-5 stroke-slate-500" />
      </button>
      <button
        id="verVenta"
        onClick={() =>
          (window.location.href = transaccion.cliente
            ? `/dashboard/ventas/${transaccion.id}`
            : `/dashboard/compras/${transaccion.id}`)
        }
        className="bg-primary-bg-componentes relative rounded-full group py-0.5 px-1 hover:bg-gray-100 transition-colors"
        title="Ver operación"
      >
        <SearchCheck className="stroke-green-500 w-5" />
      </button>
    </div>
  );

  const newArray = arrayUltimasTransacciones?.map((transaccion) => {
    return {
      id: transaccion.id,
      nId: (
        <p className="text-xs text-gray-400 font-mono">
          #{transaccion.id.slice(0, 8)}
        </p>
      ),
      fecha: <p className="text-xs">{formatDate(transaccion.fecha)}</p>,
      cliente: transaccion.cliente || transaccion.proveedor,
      tipo: transaccion.cliente ? (
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 uppercase font-bold">Venta</span>
      ) : (
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 uppercase font-bold">Compra</span>
      ),
      total: <span className="font-bold text-gray-800">{formateoMoneda.format(transaccion.total)}</span>,
      metodoPago: transaccion.metodoPago,
    };
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">Últimas Transacciones</h2>
        <a
          href="/dashboard/transaccionesTodas"
          className="text-primary-100 text-sm font-semibold hover:text-primary-100/80 transition-colors"
        >
          Ver todas
        </a>
      </div>

      <Table 
        arrayBody={newArray} 
        columnas={columnsUltimasTransacciones} 
        renderBotonActions={renderActions}
      />
    </div>
  );
};

export default UltimasTransacciones;
