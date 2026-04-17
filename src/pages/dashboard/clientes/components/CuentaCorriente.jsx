import React, { useState, useEffect } from "react";
import { formateoMoneda } from "../../../../utils/formateoMoneda";
import formatDate from "../../../../utils/formatDate";
import { Card } from "../../../../components/organismos/Card";
import { showToast } from "../../../../utils/toast/toastShow";
import Button from "../../../../components/atomos/Button";

export default function CuentaCorriente({ clienteId, userId }) {
  const [movements, setMovements] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pagoData, setPagoData] = useState({
    monto: 0,
    observaciones: "",
    metodoPago: "efectivo",
  });

  useEffect(() => {
    cargarMovimientos();
  }, [clienteId]);

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/clientes/${clienteId}/cuenta-corriente`,
        {
          method: "GET",
          headers: { "x-user-id": userId },
        },
      );
      const data = await response.json();
      setMovements(data.movements || []);
      setPendingItems(data.pendingItems || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const totalValorizado = pendingItems.reduce(
    (acc, item) => acc + item.cantidadPendiente * item.precioActual,
    0,
  );
  const totalOriginal = pendingItems.reduce(
    (acc, item) => acc + item.cantidadPendiente * item.precioOriginal,
    0,
  );

  const handlePago = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/clientes/${clienteId}/cuenta-corriente`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify(pagoData),
        },
      );
      const res = await response.json();
      setLoading(false);
      if (res.status === 200) {
        showToast("Pago registrado correctamente", {
          background: "bg-green-600",
        });
        setShowModal(false);
        cargarMovimientos();
        window.location.reload();
      } else {
        showToast(res.msg, { background: "bg-red-500" });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      showToast("Error al procesar pago", { background: "bg-red-500" });
    }
  };

  return (
    <div className="space-y-2">
      <Card className="border-l-4 border-l-orange-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-orange-800 flex items-center gap-2">
              Deuda en Mercadería
            </h2>
            <p className="text-sm text-gray-600">
              Lo que el cliente debe, valorizado al precio actual del sistema.
            </p>
          </div>
          <div className="text-right bg-orange-50 p-3 rounded-lg border border-orange-200 w-full md:w-auto">
            <span className="text-xs uppercase font-bold text-orange-600 block">
              Total a Cobrar Hoy
            </span>
            <span className="text-3xl font-black text-orange-700 font-mono">
              {formateoMoneda.format(totalValorizado)}
            </span>
            {totalValorizado > totalOriginal && (
              <p className="text-xs text-red-600 font-bold mt-1">
                variacion:{" "}
                {formateoMoneda.format(totalValorizado - totalOriginal)}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 text-left">Producto</th>
                <th className="py-2 text-center">Cant.</th>
                <th className="py-2 text-right">Precio Original</th>
                <th className="py-2 text-right">Precio HOY</th>
                <th className="py-2 text-right">Subtotal Actual</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    No hay productos pendientes de pago.
                  </td>
                </tr>
              ) : (
                pendingItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-orange-50/30 transition"
                  >
                    <td className="py-3 font-semibold text-gray-800">
                      {item.nombre}
                    </td>
                    <td className="py-3 text-center">
                      {item.cantidadPendiente}
                    </td>
                    <td className="py-3 text-right text-gray-400 line-through">
                      {formateoMoneda.format(item.precioOriginal)}
                    </td>
                    <td className="py-3 text-right font-bold text-orange-600">
                      {formateoMoneda.format(item.precioActual)}
                    </td>
                    <td className="py-3 text-right font-black text-gray-900 font-mono">
                      {formateoMoneda.format(
                        item.cantidadPendiente * item.precioActual,
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECCIÓN DE HISTORIAL DE MOVIMIENTOS */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Historial de la Libretita</h2>
          <Button variant="green" onClick={() => setShowModal(true)}>
            Registrar Entrega / Pago
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 text-left">Fecha</th>
                <th className="py-2 text-left">Concepto</th>
                <th className="py-2 text-right">Debe (+)</th>
                <th className="py-2 text-right">Haber (-)</th>
                <th className="py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No hay movimientos registrados.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="border-b">
                    <td className="py-2">{formatDate(mov.fecha)}</td>
                    <td className="py-2">
                      {mov.observaciones}
                      {mov.ventaId && (
                        <a
                          href={`/dashboard/ventas/${mov.ventaId}`}
                          className="ml-2 text-blue-500 hover:underline"
                        >
                          Ver Venta
                        </a>
                      )}
                    </td>
                    <td className="py-2 text-right text-red-600 font-mono">
                      {mov.tipo === "DEUDA"
                        ? formateoMoneda.format(mov.monto)
                        : "-"}
                    </td>
                    <td className="py-2 text-right text-green-600 font-mono">
                      {mov.tipo === "PAGO"
                        ? formateoMoneda.format(mov.monto)
                        : "-"}
                    </td>
                    <td className="py-2 text-right font-bold font-mono">
                      {formateoMoneda.format(mov.saldoResultante)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Pago */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">
                Registrar Entrega / Pago
              </h3>
              <form onSubmit={handlePago} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Monto a Cobrar
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border p-2 rounded-lg"
                    onChange={(e) =>
                      setPagoData({
                        ...pagoData,
                        monto: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Método de Pago
                  </label>
                  <select
                    className="w-full border p-2 rounded-lg"
                    onChange={(e) =>
                      setPagoData({ ...pagoData, metodoPago: e.target.value })
                    }
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Observaciones
                  </label>
                  <textarea
                    className="w-full border p-2 rounded-lg"
                    rows="2"
                    placeholder="Ej: Pago a cuenta, cancelación total, etc."
                    onChange={(e) =>
                      setPagoData({
                        ...pagoData,
                        observaciones: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="cancel" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button loading={loading} variant="green" type="submit">
                    Confirmar Cobro
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
