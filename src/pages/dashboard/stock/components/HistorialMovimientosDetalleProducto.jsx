import DivReact from '../../../../components/atomos/DivReact'
import Table from '../../../../components/tablaComponentes/Table'
import { calcularStockInicial, obtenerMovimientosOrdenados } from '../../../../utils/detallesProducto';
import { useEffect, useState } from "react";
import { HistoryIcon, TrendingDown, TrendingUp } from "lucide-react";
import formatDate from '../../../../utils/formatDate';
import { detallesProductosColumns } from '../../../../utils/columnasTables';

export default function HistorialMovimientosDetalleProducto({ productoId }) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productoId) return;
    setLoading(true);

    const fetching=async()=>{
      try {
        const response=await fetch(`/api/movimientos/producto/${productoId}`)
        const data=await response.json()
        console.log(data)
        setMovimientos(data.stockMovimiento)
        setLoading(false)
      } catch (error) {
        console.log(error)
      }
    }
    fetching()
  }, [productoId]);

  const movimientosOrdenados = obtenerMovimientosOrdenados(movimientos);
  const stockInicial = calcularStockInicial(movimientos);
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
          <p className="flex items-center gap-2 text-green-600 normal">
            <TrendingDown className="h-4 w-4" /> Ingreso
          </p>
        ) : (
          <p className="flex text-primary-400 items-center gap-2">
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
        <HistoryIcon /> Historial de Movimiento
      </h3>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse bg-gray-200 rounded-md h-10 w-full"
            />
          ))}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table
            arrayBody={newArray.reverse()}
            columnas={detallesProductosColumns}
          />
        </div>
      )}
    </DivReact>
  );
}

