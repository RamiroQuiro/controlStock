import React from 'react'
import DivReact from '../../../../../components/atomos/DivReact';
import { formateoMoneda } from '../../../../../utils/formateoMoneda';
import Table from '../../../../../components/tablaComponentes/Table';

type ComprasProveedor = {

    id: string;
    fecha: number;
    total: number;
    estado: string;
    }

    const columnas = [
        {
          label: "fecha",
          id: 1,
          selector: (row) => row.fecha }
        ,{
          label: "total",
          id:2,
          selector: (row) => row.total
        },
        {
          label: "estado",
          id:3,
          selector: (row) => row.estado
        },
        {
          label: "Acciones",
          id:4,
        },
      ];  
export const HistorialComprasProveedor = ({comprasProveedor,}: {comprasProveedor: [ComprasProveedor];}) => {


const nerArray= comprasProveedor?.map((compra)=>({
    'Fecha': new Date(compra.fecha * 1000).toLocaleDateString(),
    'Total': formateoMoneda.format(compra.total),
    'Estado':<span
    className={`px-2 py-1 rounded-full text-xs ${
      compra.estado === "completado"
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {compra.estado}
  </span>,
    'Acciones': <a href={`/dashboard/ventas/${compra.id}`} className="text-blue-600 hover:text-blue-800">Ver detalle</a>,
  }));

  return (
    <DivReact>
      <h2 className="text-xl font-semibold mb-4">Historial de Compras</h2>
      <div className="overflow-x-auto">
        <Table columnas={columnas} arrayBody={nerArray}/>
      
      </div>
    </DivReact>
  );
};