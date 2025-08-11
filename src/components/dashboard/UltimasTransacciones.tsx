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

const UltimasTransacciones: React.FC = () => {
  const { data } = useStore(statsDashStore);
  let arrayUltimasTransacciones: Transaccion[] =
    data?.data?.dataDb?.ultimasTransacciones || [];

  const newArray = arrayUltimasTransacciones?.map((transaccion) => {
    return {
      nId: (
        <p className="text-xs relative group">
          ...{transaccion.id.slice(6, -1)}
        </p>
      ),
      fecha: <p className="text-xs">{formatDate(transaccion.fecha)}</p>,
      cliente: transaccion.cliente
        ? transaccion.cliente
        : transaccion.proveedor,
      tipo: transaccion.cliente ? 'venta' : 'compra',
      total: formateoMoneda.format(transaccion.total),
      metodoPago: transaccion.metodoPago,
      acciones: (
        <div className="flex items-center justify-center gap-2 w-full">
          <button
            id="impresionVenta"
            className="bg-primary-bg-componentes relative rounded-full group py-0.5 px-1"
          >
            {' '}
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[103%] bg-primary-textoTitle/90 px-1 py-0.5 w-16 text-xs text-white hidden group-hover:flex items-center justify-center animate-aparecer">
              imprimir
            </span>
            <Printer className="w-5 stroke-slate-500" />
          </button>
          <button
            id="verVenta"
            onClick={() =>
              (window.location.href = transaccion.cliente
                ? `/dashboard/ventas/${transaccion.id}`
                : `/dashboard/compras/${transaccion.id}`)
            }
            className="bg-primary-bg-componentes relative rounded-full group py-0.5 px-1"
          >
            {' '}
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[103%] bg-primary-textoTitle/90 px-1 py-0.5 w-16 text-xs text-white hidden group-hover:flex items-center  justify-center animate-aparecer">
              ver oper...
            </span>
            <SearchCheck className="stroke-green-500 w-5 " />
          </button>
        </div>
      ),
    };
  });
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
    <div className=" w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Últimas Transacciones</h2>
        <a
          href="/dashboard/transaccionesTodas"
          className="text-primary-100 text-sm font-medium hover:underline"
        >
          Ver todas
        </a>
      </div>

      <div className="overflow-x-auto">
        <Table arrayBody={newArray} columnas={columnsUltimasTransacciones} />
      </div>
    </div>
  );
};

export default UltimasTransacciones;
