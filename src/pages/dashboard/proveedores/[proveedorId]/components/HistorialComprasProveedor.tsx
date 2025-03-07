import React from 'react'
import DivReact from '../../../../../components/atomos/DivReact';
import { formateoMoneda } from '../../../../../utils/formateoMoneda';

type ComprasProveedor = {

    id: string;
    fecha: number;
    total: number;
    estado: string;
    }

export const HistorialComprasProveedor = ({comprasProveedor,}: {comprasProveedor: [ComprasProveedor];}) => {
  return (
    <DivReact>
      <h2 className="text-xl font-semibold mb-4">Historial de Compras</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Fecha</th>
              <th className="text-left py-3">Total</th>
              <th className="text-left py-3">Descripción</th>
              <th className="text-left py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasProveedor.map((compra) => (
              <tr key={compra.id} className="border-b tex-sm">
                <td className="py-3">
                  {new Date(compra.fecha * 1000).toLocaleDateString()}
                </td>
                <td className="py-3">{formateoMoneda.format(compra.total)}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      compra.estado === "completado"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {compra.estado}
                  </span>
                </td>
                <td className="py-3">
                  <a
                    href={`/dashboard/ventas/${compra.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver detalle
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DivReact>
  );
};