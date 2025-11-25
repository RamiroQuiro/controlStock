import React, { useState, useEffect } from "react";
import Table from "../../../../components/tablaComponentes/Table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LoaderCircle, ArrowLeft, ArrowRight } from "lucide-react";

export default function TablaMovimientosStock() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  const fetchMovimientos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stock/movimientos?page=${page}&limit=${limit}`
      );
      const data = await res.json();
      if (data.status === 200) {
        setMovimientos(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching movimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, [page]);

  const columnas = [
    {
      label: "Fecha",
      id: "fecha",
      selector: (row) =>
        format(new Date(row.fecha), "dd/MM/yyyy HH:mm", { locale: es }),
    },
    {
      label: "Producto",
      id: "producto",
      selector: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.productoNombre}</span>
          <span className="text-xs text-gray-500">{row.productoCodigo}</span>
        </div>
      ),
    },
    {
      label: "Tipo",
      id: "tipo",
      selector: (row) => {
        let color = "bg-gray-100 text-gray-800";
        if (row.tipo === "ingreso") color = "bg-green-100 text-green-800";
        if (row.tipo === "egreso") color = "bg-red-100 text-red-800";
        if (row.tipo === "ajuste") color = "bg-orange-100 text-orange-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${color}`}
          >
            {row.tipo}
          </span>
        );
      },
    },

    {
      label: "Motivo",
      id: "motivo",
      selector: (row) => row.motivo || "-",
    },
    {
      label: "Usuario",
      id: "usuario",
      selector: (row) => row.usuarioNombre || "Sistema",
    },
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Historial de Movimientos
        </h2>
        <div className="flex gap-2">
          {/* Aquí irían los filtros de fecha en el futuro */}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <LoaderCircle className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          <Table columnas={columnas} arrayBody={movimientos} />

          {/* Paginación */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
