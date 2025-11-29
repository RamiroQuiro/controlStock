import { useState, useEffect, useMemo } from "react";
import { showToast } from "../../../../../utils/toast/toastShow";
import Table from "../../../../../components/tablaComponentes/Table";

const TablaPendientesRecepcion = ({ user, onSeleccionarTraslado }) => {
  const [traslados, setTraslados] = useState([]);
  const [cargando, setCargando] = useState(false);

  const fetchPendientes = async () => {
    try {
      setCargando(true);
      const response = await fetch(
        `/api/traslados/pendientes?depositoId=${user.depositoDefault}`,
        {
          headers: {
            "x-empresa-id": user.empresaId,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setTraslados(data.data || []);
      } else {
        showToast("Error al cargar traslados pendientes", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error de conexión", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (user?.depositoDefault) {
      fetchPendientes();
    }
  }, [user]);

  // 1. Columnas para el Header (THead)
  const columns = [
    { label: "N°", selector: (row) => row.numero },
    { label: "Fecha", selector: (row) => row.fechaCreacion },
    { label: "Remito #", selector: (row) => row.numeroRemito },
    { label: "Origen", selector: (row) => row.origen },
    { label: "Enviado Por", selector: (row) => row.enviadoPor },
    { label: "Items", selector: (row) => row.cantidadItems },
    { label: "Estado", selector: (row) => row.estado },
    { label: "Acciones", selector: null }, // Columna para acciones
  ];

  // 2. Mapeo de datos para el Body (TBody)
  const datosTabla = useMemo(
    () =>
      traslados.map((t, i) => ({
        id: t.id, // Se usa para identificar la fila pero se borra antes de renderizar (ver Tr.jsx)
        numero: i + 1,
        fechaCreacion: new Date(t.fechaCreacion).toLocaleDateString(),
        numeroRemito: t.numeroRemito,
        origen: t.origen,
        enviadoPor: t.enviadoPor,
        cantidadItems: t.cantidadItems,
        estado: (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            {t.estado.toUpperCase()}
          </span>
        ),
      })),
    [traslados]
  );

  // 3. Renderizado de Botones de Acción
  const renderActions = (row) => {
    // Recuperamos el objeto original buscando por ID
    const trasladoOriginal = traslados.find((t) => t.id === row.id);

    return (
      <div className="flex gap-2 justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSeleccionarTraslado(trasladoOriginal);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors"
          title="Recibir Mercadería"
        >
          Recibir
        </button>
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="p-4 text-center">Cargando traslados pendientes...</div>
    );
  }

  if (traslados.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        <p>No hay traslados pendientes de recepción.</p>
        <button
          onClick={fetchPendientes}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Traslados Pendientes de Recepción
        </h3>
        <button
          onClick={fetchPendientes}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          🔄 Actualizar
        </button>
      </div>
      <Table
        columnas={columns}
        arrayBody={datosTabla}
        renderBotonActions={renderActions}
      />
    </div>
  );
};

export default TablaPendientesRecepcion;
