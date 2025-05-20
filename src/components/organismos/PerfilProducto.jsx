import ContenedorBotonera from '../moleculas/ContenedorBotonera';
import HistorialMovimientosDetalleProducto from '../../pages/dashboard/stock/components/HistorialMovimientosDetalleProducto';
import StatsInfoDetalleProducto from '../../pages/dashboard/stock/components/StatsInfoDetalleProducto';
import DetalleFotoDetalleProducto from '../../pages/dashboard/stock/components/DetalleFotoDetalleProducto';
import { useEffect, useState } from 'react';
import { showToast } from '../../utils/toast/toastShow';
import ModalConfirmacion from '../moleculas/ModalConfirmacion';
import { useStore } from '@nanostores/react';
import { perfilProducto } from '../../context/store';
import { downloadLoader } from '../../utils/loader/showDownloadLoader';
import { loader } from '../../utils/loader/showLoader';

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
          method: 'DELETE',
        }
      );
      if (res.ok) {
        window.location.href = '/dashboard/stock';
      }
    } catch (error) {
      console.log(error);
      setModalConfirmacion(false);
      showToast('error al eliminar', { backgorund: 'bg-red-500' });
    }
  };

  const handleEdit = async () => {
    setDisableEdit(!disableEdit);
loader(true)
    if (!disableEdit) {
      try {
        const response = await fetch(
          `/api/productos/productos?search=${data.productData.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              srcPhoto: data.productData.srcPhoto,
            },
            body: JSON.stringify(formulario),
          }
        );
        const dataRes = await response.json();
        console.log(dataRes);
        
        if (dataRes.status === 200) {
          showToast('producto actualizado', { background: 'bg-green-500' });
          setTimeout(() => window.location.reload(), 750);
          loader(false)
        } else if (dataRes.status === 409) {
          showToast(dataRes.msg, { background: 'bg-red-500' });
          loader(false)
        }
      } catch (error) {
        console.log(error);
        showToast('error al actualizar', { background: 'bg-red-500' });
        loader(false)
        }
    }
    loader(false)
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormulario((prevFormulario) => ({ ...prevFormulario, [name]: value }));
  };

  const handleDownloadPdf = async () => {
    downloadLoader(true)
    try {
      const response = await fetch(
        `/api/productos/generarPdf/${data.productData.id}`,
        {
          method: 'GET',
          headers: {
            'xx-user-id': data.productDatauserId, // Asegúrate de tener userId disponible
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `producto_${data.productData.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        downloadLoader(false)
      } else {
        showToast('Error al generar PDF', { background: 'bg-red-500' });
        downloadLoader(false)
      }
    } catch (error) {
      console.error('Error descargando PDF:', error);
      showToast('Error al descargar PDF', { background: 'bg-red-500' });
    }
    downloadLoader(false)
  };

  return (
    <div className="w-full flex flex-col h-full text-sm md:px-3 px-1 relative -translate-y-5 rounded-lg items-stretch">
      {modalConfirmacion && (
        <ModalConfirmacion
          handleCancelar={() => setModalConfirmacion(false)}
          handleConfirmar={handleEliminar}
        />
      )}
      <div className="flex justify-between flex-col md:flex-row pr-16 md:items-center mb-4">
        <h2 className="text-lg font-semibold text-primary-textoTitle">
          Detalle del Producto
        </h2>
        {/* botonera */}
        <ContenedorBotonera
          downloadPdf={handleDownloadPdf}
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
