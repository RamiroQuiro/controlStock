import { History, TrendingDown, TrendingUp } from 'lucide-react'
import DivReact from '../../../../components/atomos/DivReact'
import Table from '../../../../components/tablaComponentes/Table'
import { calcularStockInicial, obtenerMovimientosOrdenados } from '../../../../utils/detallesProducto';
import { useStore } from '@nanostores/react';
import { perfilProducto } from '../../../../context/store';
import { detallesProductosColumns } from '../../../../utils/columnasTables';
import formatDate from '../../../../utils/formatDate';
export default function HistorialMovimientosDetalleProducto({}) {
  const { data, loading } = useStore(perfilProducto);
  const movimientosOrdenados = obtenerMovimientosOrdenados(
    data?.stockMovimiento
  );
  const stockInicial = calcularStockInicial(data?.stockMovimiento);

  let stockActual = stockInicial;
  const newArray = movimientosOrdenados.map((mov, i) => {
    const esEgreso = mov.tipo === "egreso";
    if (mov.motivo !== "StockInicial") {
      stockActual = esEgreso
        ? stockActual - mov.cantidad
        : stockActual + mov.cantidad;
    }

    return {
      n: i + 1,
      tipo:
        mov.tipo === "ingreso" ? (
          <p className="flex items-center justify gap-2 text-green-600 normal">
            <TrendingDown className="h-4 w-4" /> Ingreso
          </p>
        ) : (
          <p className="flex text-primary-400 items-center justify-normal gap-2">
            <TrendingUp className="h-4 w-4" /> Egreso
          </p>
        ),
      cantidad: mov.cantidad,
      motivo: mov.motivo,
      ralacion: mov.tipoResponsable,
      efectuado: mov.nombreResponsable,
      fecha: formatDate(mov.fecha),
      stockRestante: stockActual,
    };
  });

  return (
    <DivReact>
      <h3 className="flex items-center gap-4 text-lg font-semibold text-gray-700 mb-2">
        <History /> Historial de Movimiento
      </h3>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse bg-gray-200 rounded-md h-10 w-full" />
          ))}
        </div>
      ) : (
        <Table arrayBody={newArray.reverse()} columnas={detallesProductosColumns} />
      )}
    </DivReact>
  );
}
