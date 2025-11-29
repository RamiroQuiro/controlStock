import { useState, useEffect, useMemo } from "react";
import { showToast } from "../../../../../utils/toast/toastShow";
import Table from "../../../../../components/tablaComponentes/Table";

const TablaHistorialTraslados = ({ user, onVerDetalle }) => {
  const [traslados, setTraslados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const fetchHistorial = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams({
        empresaId: user.empresaId,
        ...(filtros.estado && { estado: filtros.estado }),
        ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
        ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta }),
      });

      const response = await fetch(`/api/traslados/historial?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTraslados(data.data || []);
      } else {
        showToast("Error al cargar historial", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error de conexión", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (user?.empresaId) {
      fetchHistorial();
    }
  }, [user, filtros]);

  const columns = [
    { label: "N°", selector: (row) => row.numero },
    { label: "Remito #", selector: (row) => row.numeroRemito },
    { label: "Fecha", selector: (row) => row.fechaCreacion },
    { label: "Origen", selector: (row) => row.origenNombre },
    { label: "Destino", selector: (row) => row.destinoNombre },
    { label: "Items", selector: (row) => row.cantidadItems },
    { label: "Estado", selector: (row) => row.estado },
    { label: "Acciones", selector: null },
  ];

  const datosTabla = useMemo(
    () =>
      traslados.map((t, i) => ({
        id: t.id,
        numero: i + 1,
        numeroRemito: t.numeroRemito,
        fechaCreacion: new Date(t.fechaCreacion).toLocaleDateString(),
        origenNombre: t.origenNombre,
        destinoNombre: t.destinoNombre,
        cantidadItems: t.cantidadItems,
        estado: (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              t.estado === "recibido"
                ? "bg-green-100 text-green-800"
                : t.estado === "cancelado"
                  ? "bg-red-100 text-red-800"
                  : t.estado === "enviado"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {t.estado.toUpperCase()}
          </span>
        ),
      })),
    [traslados]
  );

  const renderActions = (row) => {
    const trasladoOriginal = traslados.find((t) => t.id === row.id);

    return (
      <div className="flex gap-2 justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerDetalle(trasladoOriginal);
          }}
          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm transition-colors"
          title="Ver Detalle"
        >
          Ver
        </button>
      </div>
    );
  };

  if (cargando) {
    return <div className="p-4 text-center">Cargando historial...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
            <option value="recibido">Recibido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) =>
              setFiltros({ ...filtros, fechaDesde: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) =>
              setFiltros({ ...filtros, fechaHasta: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>

        <button
          onClick={() =>
            setFiltros({ estado: "", fechaDesde: "", fechaHasta: "" })
          }
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Historial de Traslados ({traslados.length})
        </h3>
        <button
          onClick={fetchHistorial}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          🔄 Actualizar
        </button>
      </div>

      {traslados.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <p>No hay traslados para mostrar.</p>
        </div>
      ) : (
        <Table
          columnas={columns}
          arrayBody={datosTabla}
          renderBotonActions={renderActions}
        />
      )}
    </div>
  );
};

export default TablaHistorialTraslados;
