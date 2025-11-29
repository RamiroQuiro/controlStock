import React, { useState } from "react";
import { Building2, Package, Save } from "lucide-react";

const TablaStockDepositos = ({ stockDetalle }) => {
  const [editedStock, setEditedStock] = useState({});
  const [saving, setSaving] = useState({});

  if (!stockDetalle || stockDetalle.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
        No hay información de stock detallada disponible.
      </div>
    );
  }

  const handleChange = (stockId, field, value) => {
    setEditedStock((prev) => ({
      ...prev,
      [stockId]: {
        ...prev[stockId],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleSave = async (item) => {
    const stockId = item.id;
    const changes = editedStock[stockId];

    if (!changes) return; // No hay cambios

    try {
      setSaving((prev) => ({ ...prev, [stockId]: true }));

      const response = await fetch("/api/stock/actualizar-alerta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId,
          alertaStock: changes.alertaStock ?? item.alertaStock,
          reservado: changes.reservado ?? item.reservado,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar");
      }

      // Limpiar cambios guardados
      setEditedStock((prev) => {
        const newState = { ...prev };
        delete newState[stockId];
        return newState;
      });

      alert("Stock actualizado correctamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el stock");
    } finally {
      setSaving((prev) => ({ ...prev, [stockId]: false }));
    }
  };

  const getValue = (item, field) => {
    return editedStock[item.id]?.[field] ?? item[field] ?? 0;
  };

  const hasChanges = (stockId) => {
    return editedStock[stockId] !== undefined;
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-700 text-sm">
          Gestión de Stock por Sucursal
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Sucursal / Depósito</th>
              <th className="px-4 py-3 font-medium text-right">Stock Total</th>
              <th className="px-4 py-3 font-medium text-right">
                Reservado Offline
              </th>
              <th className="px-4 py-3 font-medium text-right">
                Disponible Online
              </th>
              <th className="px-4 py-3 font-medium text-right">Alerta Stock</th>
              <th className="px-4 py-3 font-medium text-center">Estado</th>
              <th className="px-4 py-3 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stockDetalle.map((item, index) => {
              const reservado = getValue(item, "reservado");
              const disponibleOnline = (item.cantidad || 0) - reservado;
              const alertaStock = getValue(item, "alertaStock");
              const isLowStock = item.cantidad <= alertaStock;

              return (
                <tr
                  key={item.id || index}
                  className="bg-white border-b hover:bg-gray-50 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.depositoNombre || "Depósito Desconocido"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-700">
                    {item.cantidad || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      max={item.cantidad || 0}
                      value={reservado}
                      onChange={(e) =>
                        handleChange(item.id, "reservado", e.target.value)
                      }
                      className="w-20 px-2 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-600">
                    {disponibleOnline}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={alertaStock}
                      onChange={(e) =>
                        handleChange(item.id, "alertaStock", e.target.value)
                      }
                      className="w-20 px-2 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isLowStock
                          ? "bg-red-100 text-red-800"
                          : item.cantidad > alertaStock * 2
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isLowStock
                        ? "⚠️ Bajo Stock"
                        : item.cantidad > alertaStock * 2
                          ? "✅ OK"
                          : "⚡ Medio"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {hasChanges(item.id) && (
                      <button
                        onClick={() => handleSave(item)}
                        disabled={saving[item.id]}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      >
                        <Save className="w-3 h-3" />
                        {saving[item.id] ? "Guardando..." : "Guardar"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold text-gray-900">
            <tr>
              <td className="px-4 py-3">Total General</td>
              <td className="px-4 py-3 text-right">
                {stockDetalle.reduce(
                  (acc, curr) => acc + (curr.cantidad || 0),
                  0
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {stockDetalle.reduce(
                  (acc, curr) => acc + getValue(curr, "reservado"),
                  0
                )}
              </td>
              <td className="px-4 py-3 text-right text-blue-600">
                {stockDetalle.reduce((acc, curr) => {
                  const reservado = getValue(curr, "reservado");
                  return acc + ((curr.cantidad || 0) - reservado);
                }, 0)}
              </td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TablaStockDepositos;
