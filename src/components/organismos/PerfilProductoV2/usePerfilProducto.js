
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { perfilProducto } from '../../../context/store';
import { showToast } from '../../../utils/toast/toastShow';
import { downloadLoader } from '../../../utils/loader/showDownloadLoader';
import { loader } from '../../../utils/loader/showLoader';

export const usePerfilProducto = (onClose) => {
  const { data, loading } = useStore(perfilProducto);
  
  const [formulario, setFormulario] = useState({});
  const [originalFormulario, setOriginalFormulario] = useState(null); // Para guardar el estado original al editar
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (data?.productData) {
      setFormulario(data.productData);
    }
  }, [data?.productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // --- NUEVO FLUJO DE EDICIÓN ---

  // 1. Entra en modo edición y guarda el estado actual
  const handleEnterEditMode = () => {
    setOriginalFormulario(formulario);
    setIsEditing(true);
  };

  // 2. Cancela la edición y restaura el formulario original
  const handleCancelEdit = () => {
    setFormulario(originalFormulario);
    setIsEditing(false);
  };

  // 3. Guarda los cambios en la API
  const handleSave = async () => {
    if (!data?.productData?.id) {
      showToast("Error: No se pudo encontrar el producto a actualizar.", { background: 'bg-red-500' });
      setIsEditing(false);
      return;
    }

    loader(true);
    try {
      const response = await fetch(`/api/productos/productos?search=${data.productData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });
      const resData = await response.json();

      if (!response.ok) throw new Error(resData.msg || 'Error al actualizar');
      
      showToast('Producto actualizado con éxito', { background: 'bg-green-500' });
      setIsEditing(false); // Salimos del modo edición
      // Opcional: podrías querer cerrar el modal después de guardar
      // setTimeout(() => onClose(), 500);

    } catch (error) {
      console.error(error);
      showToast(error.message, { background: 'bg-red-500' });
    } finally {
      loader(false);
    }
  };

  const handleDelete = async () => {
    // ... (la lógica de eliminar no cambia)
    loader(true);
    try {
      const res = await fetch(`/api/productos/productos?search=${data.productData.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar el producto');
      showToast('Producto eliminado', { background: 'bg-green-500' });
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.message, { background: 'bg-red-500' });
    } finally {
      setIsConfirmingDelete(false);
      loader(false);
    }
  };

  const handleDownloadPdf = async () => {
    // ... (la lógica de descargar PDF no cambia)
    downloadLoader(true);
    try {
      const response = await fetch(`/api/productos/generarPdf/${data.productData.id}`);
      if (!response.ok) throw new Error('Error al generar el PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `producto_${data.productData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error descargando PDF:', error);
      showToast(error.message, { background: 'bg-red-500' });
    } finally {
      downloadLoader(false);
    }
  };

  return {
    isLoading: loading,
    isEditing,
    isConfirmingDelete,
    producto: formulario,
    
    actions: {
      handleChange,
      handleEnterEditMode, // <- Acción para entrar a editar
      handleSave,          // <- Acción para guardar
      handleCancelEdit,    // <- Acción para cancelar
      handleDelete,
      handleDownloadPdf,
      openDeleteConfirm: () => setIsConfirmingDelete(true),
      closeDeleteConfirm: () => setIsConfirmingDelete(false),
    },
  };
};
