import formatDate from "../../utils/formatDate";
import { TrendingDown, TrendingUp } from "lucide-react";
import ContenedorBotonera from "../moleculas/ContenedorBotonera";
import HistorialMovimientosDetalleProducto from "../../pages/dashboard/stock/components/HistorialMovimientosDetalleProducto";
import StatsInfoDetalleProducto from "../../pages/dashboard/stock/components/StatsInfoDetalleProducto";
import DetalleFotoDetalleProducto from "../../pages/dashboard/stock/components/DetalleFotoDetalleProducto";
import {
  calcularMargenGanancia,
  calcularPrecioStock,
  calcularStockInicial,
  obtenerMovimientosOrdenados,
  obtenerUltimaReposicion,
} from "../../utils/detallesProducto";
import { useEffect, useState } from "react";
import { showToast } from "../../utils/toast/toastShow";
import ModalConfirmacion from "../moleculas/ModalConfirmacion";
import { detallesProductosColumns } from "../../utils/columnasTables";
import { useStore } from "@nanostores/react";
import { perfilProducto } from "../../context/store";

export default function PerfilProducto({}) {
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [disableEdit, setDisableEdit] = useState(true);
  const { data, loading } = useStore(perfilProducto);
  // Inicializar formulario con un objeto vacío para evitar errores
  const [formulario, setFormulario] = useState({});
  
  // Actualizar el formulario cuando data.productData cambie o cuando loading pase a false
  useEffect(() => {
    if (data?.productData) {
      setFormulario(data.productData);
    }
  }, [data?.productData]);

  const confirmarConModal = () => {
    setModalConfirmacion(true);
  };
  
  const handleEliminar = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `/api/productos/productos?search=${data.productData.id}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        window.location.href = "/dashboard/stock";
      }
    } catch (error) {
      console.log(error);
      setModalConfirmacion(false);
      showToast("error al eliminar", { backgorund: "bg-red-500" });
    }
  };
  
  const handleEdit = async () => {
    setDisableEdit(!disableEdit);

    if (!disableEdit) {
      try {
        const response = await fetch(
          `/api/productos/productos?search=${data.productData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formulario),
          }
        );
        const dataRes = await response.json();
        
        if (dataRes.status === 200) {
          showToast("producto actualizado", { background: "bg-green-500" });
          setTimeout(() => window.location.reload(), 750);
        } else if (dataRes.status === 409) {
          showToast(dataRes.msg, { background: "bg-red-500" });
        }
      } catch (error) {
        console.log(error);
        showToast("error al actualizar", { background: "bg-red-500" });
      }
    }
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormulario((prevFormulario) => ({ ...prevFormulario, [name]: value }));
  };
  
  return (
    <div className="w-full flex flex-col h-full text-sm px-3 relative -translate-y-5 rounded-lg items-stretch">
      {modalConfirmacion && (
        <ModalConfirmacion
          handleCancelar={() => setModalConfirmacion(false)}
          handleConfirmar={handleEliminar}
        />
      )}
      <div className="flex justify-between pr-16 items-center mb-4">
        <h2 className="text-lg font-semibold text-primary-textoTitle">
          Detalle del Producto
        </h2>
        {/* botonera */}
        <ContenedorBotonera
          disableEdit={disableEdit}
          handleEdit={handleEdit}
          handleDelete={confirmarConModal}
        />
      </div>

      <div className="flex flex-col w-full pb-6 items-center justify-normal gap-2">
        {/* info del producto */}
        <DetalleFotoDetalleProducto
          handleChangeForm={handleChangeForm}
          disableEdit={disableEdit}
          formulario={formulario}
        />
        {/* info stats */}
        <StatsInfoDetalleProducto
          handleChangeForm={handleChangeForm}
          disableEdit={disableEdit}
          formulario={formulario}
        />
        {/* historial Movimientos */}
        <HistorialMovimientosDetalleProducto />
      </div>
    </div>
  );
}