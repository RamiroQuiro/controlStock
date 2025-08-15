import ContenedorBotonera from '../moleculas/ContenedorBotonera';
import HistorialMovimientosDetalleProducto from '../../pages/dashboard/stock/components/HistorialMovimientosDetalleProducto';
import StatsInfoDetalleProducto from '../../pages/dashboard/stock/components/StatsInfoDetalleProducto';
import DetalleFotoDetalleProducto from '../../pages/dashboard/stock/components/DetalleFotoDetalleProducto';
import { useEffect, useMemo, useState } from 'react';
import { showToast } from '../../utils/toast/toastShow';
import ModalConfirmacion from '../moleculas/ModalConfirmacion';
import { useStore } from '@nanostores/react';
import { perfilProducto } from '../../context/store';
import { downloadLoader } from '../../utils/loader/showDownloadLoader';
import { loader } from '../../utils/loader/showLoader';
// PerfilProducto.jsx (o .tsx)


// Store

// Services (ya los creaste)
import {
  obtenerPronostico,
  actualizarProducto,
  eliminarProducto,
  descargarPDF,
} from "../../services/productos.services";

// (Opcional) si tenés utilidades de UI
// import { showToast } from "../../utils/toast";

export default function PerfilProducto({ onClose }) {
  const { data, loading } = useStore(perfilProducto); // data: { productData, depositosDB, ubicacionesDB, ... }
  const [formulario, setFormulario] = useState({});
  const [disableEdit, setDisableEdit] = useState(true);

  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [busy, setBusy] = useState(false);

  // Pronóstico
  const [pronosticoDemanda, setPronosticoDemanda] = useState(null);

  // 1) Cargar datos iniciales de formulario cuando cambia el producto
  useEffect(() => {
    if (data?.productData) {
      setFormulario(data.productData);
    }
  }, [data?.productData]);

  // 2) Cargar pronóstico (con cancelación simple)
  useEffect(() => {
    let cancelado = false;
    const fetchPronostico = async () => {
      if (!data?.productData?.id) return;
      try {
        const res = await obtenerPronostico(data.productData.id);
        if (!cancelado) setPronosticoDemanda(res?.pronostico ?? null);
      } catch (e) {
        console.error("Error al obtener pronóstico:", e);
        if (!cancelado) setPronosticoDemanda(null);
      }
    };
    fetchPronostico();
    return () => {
      cancelado = true;
    };
  }, [data?.productData?.id]);

  // 3) Ubicaciones filtradas por depósito seleccionado (derivado, sin estado extra)
  const ubicacionesFiltradas = useMemo(() => {
    if (!data?.ubicacionesDB || !formulario?.depositosId) return [];
    return data.ubicacionesDB.filter(
      (u) => u.depositoId === formulario.depositosId
    );
  }, [data?.ubicacionesDB, formulario?.depositosId]);

  // 4) Manejo de cambios de inputs
  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // 5) Guardado (actualización) — llamado al salir de modo edición
  const handleSave = async () => {
    if (!data?.productData?.id) return;
    try {
      setBusy(true);
      await actualizarProducto(data.productData.id, formulario, data.productData?.srcPhoto);

      // Actualizo store para mantenerlo en sync con lo que guardé
      perfilProducto.set({
        data: {
          ...data,
          productData: { ...formulario },
        },
        loading: false,
      });

      // showToast?.("Producto actualizado", { background: "bg-green-500" });
    } catch (err) {
      console.error(err);
      // showToast?.("Error al actualizar", { background: "bg-red-500" });
      // Si querés, podés mantener la edición abierta si falla
      throw err;
    } finally {
      setBusy(false);
    }
  };

  // 6) Editar/Guardar (un solo botón como ya usabas)
  const handleEdit = async () => {
    if (disableEdit) {
      // pasamos a modo edición
      setDisableEdit(false);
      return;
    }
    // estábamos editando -> guardamos
    try {
      await handleSave();
      setDisableEdit(true);
    } catch {
      // si hubo error, no cierro edición
      setDisableEdit(false);
    }
  };

  // 7) Eliminar (abre modal)
  const confirmarConModal = () => setModalConfirmacion(true);

  // 8) Confirmar eliminación (del modal)
  const handleEliminar = async () => {
    if (!data?.productData?.id) return;
    try {
      setBusy(true);
      await eliminarProducto(data.productData.id);
      // showToast?.("Producto eliminado", { background: "bg-green-500" });
      onClose(false);
    } catch (err) {
      console.error(err);
      // showToast?.("Error al eliminar", { background: "bg-red-500" });
    } finally {
      setBusy(false);
      setModalConfirmacion(false);
    }
  };

  // 9) Descargar PDF
  const handleDownloadPdf = async () => {
    if (!data?.productData?.id) return;
    try {
      setBusy(true);
      const blob = await descargarPDF(
        data.productData.id,
        data?.productData?.userId // ajustá si tu API requiere otro header/param
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `producto_${data.productData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      // showToast?.("Error al generar PDF", { background: "bg-red-500" });
    } finally {
      setBusy(false);
    }
  };

  // 10) Render
  if (loading && !data?.productData) {
    return (
      <div className="w-full p-4 text-sm">
        <div className="animate-pulse">Cargando producto…</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full text-sm md:px-3 px-1 relative py-5 rounded-lg items-stretch">
      {/* Modal confirmación eliminar */}
      {modalConfirmacion && (
        <ModalConfirmacion
          handleCancelar={() => setModalConfirmacion(false)}
          handleConfirmar={handleEliminar}
        />
      )}

      {/* HEADER FIJO */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="flex justify-between flex-col md:flex-row md:items-center gap-2 py-2">
          {/* Título / Nombre editable */}
          <div className="flex items-center gap-2">
            {disableEdit ? (
              <h2 className="text-lg font-semibold text-primary-textoTitle">
                {formulario?.nombre || "Sin nombre"}
              </h2>
            ) : (
              <input
                type="text"
                name="nombre"
                value={formulario?.nombre ?? ""}
                onChange={handleChangeForm}
                placeholder="Nombre del producto"
                className="text-base border rounded-md px-2 py-1 w-[min(420px,80vw)]"
              />
            )}
          </div>

          {/* Botonera */}
          <ContenedorBotonera
            onClose={onClose}
            downloadPdf={handleDownloadPdf}
            disableEdit={disableEdit}
            handleEdit={handleEdit}
            handleDelete={confirmarConModal}
            data={data} // mantiene compatibilidad: ContenedorBotonera usa data.productData
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex flex-col w-full pb-6 items-center justify-normal gap-3 mt-3">
        {/* Info del producto (detalle + foto) */}
        <DetalleFotoDetalleProducto
          handleChangeForm={handleChangeForm}
          disableEdit={disableEdit}
          formulario={formulario}
          depositosDB={data?.depositosDB ?? []}
          ubicacionesDB={ubicacionesFiltradas}
        />

        {/* Stats del producto (precio, etc.) */}
        <StatsInfoDetalleProducto
          handleChangeForm={handleChangeForm}
          disableEdit={disableEdit}
          formulario={formulario}
        />

        {/* Historial de movimientos (independiente, con su propio fetch) */}
        <HistorialMovimientosDetalleProducto productoId={data?.productData?.id} />

        {/* Pronóstico de demanda */}
        {pronosticoDemanda !== null && (
          <div className="w-full p-4 bg-gray-100 rounded-lg mt-2">
            <h3 className="text-md font-semibold mb-2">
              Pronóstico de Demanda
            </h3>
            <p>
              Demanda pronosticada para los próximos días:{" "}
              <strong>{Number(pronosticoDemanda).toFixed(2)}</strong> unidades.
            </p>
            <p className="text-xs text-gray-500">
              (Basado en la media móvil de los últimos 3 días de ventas)
            </p>
          </div>
        )}
      </div>

      {/* Estado global simple */}
      {busy && (
        <div className="text-xs text-gray-500 mt-2">
          Procesando…
        </div>
      )}
    </div>
  );
}
