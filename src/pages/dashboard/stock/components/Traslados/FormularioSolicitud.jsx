import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";

import DetallesTraslado from "./DetallesTraslado";
import FiltroProductosV3 from "../../../../../components/moleculas/FiltroProductos";
import { showToast } from "../../../../../utils/toast/toastShow";
import {
  productosSeleccionadosTraslado,
  infoTraslado,
  agregarProductoTraslado,
  setInfoTraslado,
  limpiarRemitoTraslado,
} from "../../../../../context/traslado.store";

const FormularioSolicitud = ({ user, empresaId, depositos }) => {
  const [error, setError] = useState({ msg: "", status: 0 });
  const $productos = useStore(productosSeleccionadosTraslado);
  const $info = useStore(infoTraslado);
  const [cargando, setCargando] = useState(false);

  // Limpiar remito al desmontar
  useEffect(() => {
    return () => {
      limpiarRemitoTraslado();
    };
  }, []);

  // Establecer sucursal destino por defecto (la del usuario que solicita)
  useEffect(() => {
    if (user.depositoId && !$info.sucursalDestinoId) {
      setInfoTraslado({ sucursalDestinoId: user.depositoId });
    }
  }, [user.depositoId]);

  const handleChangeSucursalOrigen = (e) => {
    setInfoTraslado({ sucursalOrigenId: e.target.value });
  };

  const handleChangeObservaciones = (e) => {
    setInfoTraslado({ observaciones: e.target.value });
  };

  const sucursalDestino = depositos.find((s) => s.id === user.depositoDefault);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ msg: "", status: 0 });

    // Validaciones
    if (!$info.sucursalOrigenId) {
      setError({ msg: "Debe seleccionar a quién solicitar", status: 400 });
      showToast("Debe seleccionar a quién solicitar");
      return;
    }

    if ($info.sucursalOrigenId === $info.sucursalDestinoId) {
      setError({
        msg: "No puede solicitarse mercadería a sí mismo",
        status: 400,
      });
      showToast("No puede solicitarse mercadería a sí mismo");
      return;
    }

    if ($productos.length === 0) {
      setError({ msg: "Debe agregar al menos un producto", status: 400 });
      showToast("Debe agregar al menos un producto");
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`/api/traslados/solicitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          sucursalOrigenId: $info.sucursalOrigenId, // Casa Central (a quien se le pide)
          sucursalDestinoId: sucursalDestino.id, // Sucursal (quien pide)
          observaciones: $info.observaciones,
          productos: $productos,
          userId: user.id,
          empresaId: empresaId,
        }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Error al crear la solicitud");

      showToast("Solicitud creada exitosamente");
      limpiarRemitoTraslado();
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setError({ msg: error.message, status: 400 });
      showToast(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar depositos para mostrar solo Casa Central u otros orígenes válidos
  // Asumimos que Casa Central es el depósito principal o podemos filtrar por tipo
  const sucursalesOrigen = depositos.filter(
    (s) => s.id !== $info.sucursalDestinoId
  );

  return (
    <form className="text-primary-texto gap-4 p-4 flex flex-col">
      {/* Sección depositos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sucursal Destino (Solo lectura - quien solicita) */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sucursal Solicitante
          </label>
          <div className="p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
            <p className="font-semibold">
              {sucursalDestino?.nombre || "Cargando..."}
            </p>
            <p className="text-xs text-gray-600">
              {sucursalDestino?.direccion || ""}
            </p>
          </div>
        </div>

        {/* Sucursal Origen (A quien se le solicita) */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solicitar a *
          </label>
          <select
            value={$info.sucursalOrigenId || ""}
            onChange={handleChangeSucursalOrigen}
            className="p-3 rounded-lg border-2 border-primary-100/50 focus:ring focus:border-transparent focus:ring-primary-100"
            required
          >
            <option value="">Seleccione sucursal</option>
            {sucursalesOrigen.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre} - {sucursal.direccion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sección Productos */}
      <div className="flex flex-col items-start justify-normal">
        <h3 className="text-lg font-medium mb-2">Productos a Solicitar</h3>
        <FiltroProductosV3
          modoCompra={false}
          mostrarProductos={true}
          userId={user.id}
          empresaId={empresaId}
          onProductoAgregado={agregarProductoTraslado}
        />
        <DetallesTraslado />
      </div>

      {/* Observaciones */}
      <div className="">
        <label className="block text-sm font-medium text-gray-700">
          Observaciones
        </label>
        <textarea
          value={$info.observaciones}
          onChange={handleChangeObservaciones}
          className="mt-1 block w-full p-2 rounded-lg border-2 focus:outline-none border-primary-100/50 focus:ring focus:border-transparent focus:ring-primary-100"
          rows="3"
          placeholder="Motivo de la solicitud, urgencia, etc."
        />
      </div>

      {/* Resumen */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">
          Resumen de la Solicitud
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Total de productos:</span>
            <span className="ml-2 font-semibold">{$productos.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total de unidades:</span>
            <span className="ml-2 font-semibold">
              {$productos.reduce((acc, p) => acc + p.cantidad, 0)}
            </span>
          </div>
        </div>
      </div>

      {error.msg && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error.msg}
        </div>
      )}

      {/* Botones */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => limpiarRemitoTraslado()}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Limpiar
        </button>
        <button
          onClick={handleSubmit}
          disabled={cargando}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {cargando ? "Creando Solicitud..." : "Solicitar Mercadería"}
        </button>
      </div>
    </form>
  );
};

export default FormularioSolicitud;
