import { useState, useEffect } from "react";
import { showToast } from "../../../../../utils/toast/toastShow";

const FormularioRecepcion = ({ traslado, user, onCancelar, onFinalizar }) => {
  const [items, setItems] = useState([]);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (traslado?.detalles) {
      // Inicializar items con cantidad recibida igual a la enviada por defecto
      const itemsIniciales = traslado.detalles.map((d) => ({
        ...d,
        cantidadRecibida: d.cantidadEnviada, // Por defecto asumimos que llegó todo bien
        diferencia: 0,
      }));
      setItems(itemsIniciales);
    }
  }, [traslado]);

  const handleCantidadChange = (id, nuevaCantidad) => {
    const cantidad = parseFloat(nuevaCantidad) || 0;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            cantidadRecibida: cantidad,
            diferencia: cantidad - item.cantidadEnviada,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      setProcesando(true);

      const productosRecibidos = items.map((item) => ({
        productoId: item.productoId,
        cantidadRecibida: item.cantidadRecibida,
      }));

      const response = await fetch("/api/traslados/recibir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          trasladoId: traslado.id,
          productosRecibidos,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Traslado recibido exitosamente", "success");
        onFinalizar();
      } else {
        showToast(data.error || "Error al recibir traslado", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error de conexión", "error");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-white rounded-lg">
      {/* Encabezado */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Recepción de Mercadería
          </h3>
          <p className="text-sm text-gray-500">
            Remito #{traslado.numeroRemito} - Origen: {traslado.origen}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600">
            Fecha: {new Date(traslado.fechaCreacion).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400">ID: {traslado.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Tabla de Items */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 text-center">Enviado</th>
              <th className="px-4 py-3 text-center">Recibido</th>
              <th className="px-4 py-3 text-center">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {item.nombreProducto}
                  <div className="text-xs text-gray-400">
                    {item.codigoProducto}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-medium">
                  {item.cantidadEnviada}
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.cantidadRecibida}
                    onChange={(e) =>
                      handleCantidadChange(item.id, e.target.value)
                    }
                    className={`w-24 text-center border rounded p-1 focus:ring-2 focus:outline-none ${
                      item.diferencia !== 0
                        ? "border-yellow-500 focus:ring-yellow-200 bg-yellow-50"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  {item.diferencia !== 0 ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.diferencia < 0
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.diferencia > 0 ? "+" : ""}
                      {item.diferencia}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen y Acciones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancelar}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={procesando}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={procesando}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
            procesando
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {procesando ? "Procesando..." : "Confirmar Recepción"}
        </button>
      </div>
    </div>
  );
};

export default FormularioRecepcion;
