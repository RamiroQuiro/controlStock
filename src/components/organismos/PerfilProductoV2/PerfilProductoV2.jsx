
import React from 'react';
import { usePerfilProducto } from './usePerfilProducto';

// Importamos los componentes visuales
import ContenedorBotonera from '../../moleculas/ContenedorBotonera';
import HistorialMovimientosDetalleProducto from '../../../pages/dashboard/stock/components/HistorialMovimientosDetalleProducto';
import StatsInfoDetalleProducto from '../../../pages/dashboard/stock/components/StatsInfoDetalleProducto';
import DetalleFotoDetalleProducto from '../../../pages/dashboard/stock/components/DetalleFotoDetalleProducto';
import ModalConfirmacion from '../../moleculas/ModalConfirmacion';
import Button3 from '../../atomos/Button3';

// Componente de Esqueleto para el estado de carga
const PerfilProductoEsqueleto = () => (
  <div className="w-full p-4">
    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse mb-4"></div>
    <div className="h-40 bg-gray-200 rounded w-full animate-pulse"></div>
  </div>
);

export default function PerfilProductoV2({ onClose }) {
  const {
    isLoading,
    isEditing,
    isConfirmingDelete,
    producto,
    actions,
  } = usePerfilProducto(onClose);

  if (isLoading) {
    return <PerfilProductoEsqueleto />;
  }

  return (
    <div className="w-full flex flex-col h-full text-sm md:px-3 px-1 relative py-5 rounded-lg items-stretch">
      {isConfirmingDelete && (
        <ModalConfirmacion
          handleCancelar={actions.closeDeleteConfirm}
          handleConfirmar={actions.handleDelete}
          texto='¿Estás seguro de que deseas eliminar este producto?'
        />
      )}

      <div className="flex justify-between flex-col md:flex-row md:items-center mb-4">
        <h2 className="text-lg font-semibold text-primary-textoTitle">
          Detalle del Producto
        </h2>
        
        {/* --- BOTONERA DINÁMICA --- */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            // Botones en modo "Ver"
            <ContenedorBotonera
              onClose={onClose}
              downloadPdf={actions.handleDownloadPdf}
              handleEdit={actions.handleEnterEditMode} // <- Llama a la nueva función para entrar a editar
              handleDelete={actions.openDeleteConfirm}
              isEditing={false}
            />
          ) : (
            // Botones en modo "Editar"
            <div className="flex gap-2">
              <Button3 onClick={actions.handleSave}>Guardar Cambios</Button3>
              <Button3 onClick={actions.handleCancelEdit} variant="secondary">Cancelar</Button3>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full pb-6 items-center justify-normal gap-2">
        <DetalleFotoDetalleProducto
          handleChangeForm={actions.handleChange}
          disableEdit={!isEditing} // <- El modo de edición habilita/deshabilita los inputs
          formulario={producto}
        />
        <StatsInfoDetalleProducto
          handleChangeForm={actions.handleChange}
          disableEdit={!isEditing}
          formulario={producto}
        />
        <HistorialMovimientosDetalleProducto />
      </div>
    </div>
  );
}
