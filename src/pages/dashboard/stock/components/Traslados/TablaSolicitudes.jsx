import { useState, useEffect } from "react";
import { showToast } from "../../../../../utils/toast/toastShow";

const TablaSolicitudes = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const fetchSolicitudes = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams({
        empresaId: user.empresaId,
        estado: "solicitado", // Solo solicitudes pendientes de aprobar
      });

      const response = await fetch(`/api/traslados/historial?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSolicitudes(data.data || []);
      } else {
        showToast("Error al cargar solicitudes", "error");
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
      fetchSolicitudes();
    }
  }, [user]);

  const handleAprobar = async (trasladoId) => {
    try {
      const response = await fetch("/api/traslados/aprobar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trasladoId,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error("Error al aprobar");

      showToast("Solicitud aprobada exitosamente", {
        background: "bg-green-500",
      });

      // Actualizar el estado de la solicitud seleccionada sin cerrar el modal
      setSolicitudSeleccionada((prev) => ({
        ...prev,
        estado: "aprobado",
      }));

      // Refrescar la lista
      fetchSolicitudes();
    } catch (error) {
      showToast("Error al aprobar solicitud", { background: "bg-red-500" });
    }
  };

  const handleDespachar = async (trasladoId) => {
    if (!confirm("¿Confirmar despacho? Esto descontará el stock.")) return;

    try {
      const response = await fetch("/api/traslados/despachar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trasladoId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al despachar");
      }

      showToast("Mercadería despachada exitosamente", {
        background: "bg-green-500",
      });
      fetchSolicitudes();
      setMostrarModal(false);
    } catch (error) {
      showToast(error.message, { background: "bg-red-500" });
    }
  };

  const handleVerDetalle = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarModal(true);
  };

  if (cargando) {
    return <div className="p-4 text-center">Cargando solicitudes...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Solicitudes Pendientes ({solicitudes.length})
        </h3>
        <button
          onClick={fetchSolicitudes}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          🔄 Actualizar
        </button>
      </div>

      {solicitudes.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <p>No hay solicitudes pendientes.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Remito #
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Fecha
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Sucursal
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Items
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {sol.numeroRemito}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(sol.fechaCreacion).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {sol.destinoNombre}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {sol.cantidadItems}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleVerDetalle(sol)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle */}
      {mostrarModal && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-xl font-bold">
                  Solicitud #{solicitudSeleccionada.numeroRemito}
                </h2>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Sucursal:</strong>{" "}
                  {solicitudSeleccionada.destinoNombre}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong>{" "}
                  {new Date(
                    solicitudSeleccionada.fechaCreacion
                  ).toLocaleString()}
                </p>
                {solicitudSeleccionada.observaciones && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Observaciones:</strong>{" "}
                    {solicitudSeleccionada.observaciones}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Productos Solicitados:</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Producto
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudSeleccionada.detalles?.map((det, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 px-4 py-2">
                          {det.nombreProducto}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                          {det.cantidadSolicitada}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAprobar(solicitudSeleccionada.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Aprobar Solicitud
                </button>
              </div>

              {solicitudSeleccionada.estado === "aprobado" && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-green-600 mb-2">
                    ✓ Solicitud aprobada. Ahora puedes despachar la mercadería.
                  </p>
                  <button
                    onClick={() => handleDespachar(solicitudSeleccionada.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Despachar Mercadería
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaSolicitudes;
