import React, { useState } from 'react';
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx';
import Button3 from '../../../../components/atomos/Button3.jsx';
import { showToast } from '../../../../utils/toast/toastShow.js';

interface Category {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
}

type Props = {
  setIsDialogOpen: (isOpen: boolean) => void;
  category: Category;
  onClose: () => void;
};

export default function FormularioNuevaCategoria({ category, onClose }: Props) {
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    id: category?.id || '',
    nombre: category?.nombre || '',
    descripcion: category?.descripcion || '',
    color: category?.color || 'bg-blue-500',
  });

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Azul', class: 'bg-blue-500' },
    { value: 'bg-green-500', label: 'Verde', class: 'bg-green-500' },
    { value: 'bg-purple-500', label: 'Morado', class: 'bg-purple-500' },
    { value: 'bg-red-500', label: 'Rojo', class: 'bg-red-500' },
    { value: 'bg-yellow-500', label: 'Amarillo', class: 'bg-yellow-500' },
    { value: 'bg-orange-500', label: 'Naranja', class: 'bg-orange-500' },
  ];

  const handleGuardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    try {
      const fecthNewCat = await fetch('/api/categorias', {
        method: category ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await fecthNewCat.json();
      if (data.status === 200) {
        showToast('success', data.msg);
        if (onClose) onClose();
      } else {
        setErrorMessage(data.msg);
        showToast('error', data.msg);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <form className="flex flex-col gap-4 items justify-center w-full pb-6">
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre
        </label>
        <InputComponenteJsx
          id="nombre"
          value={formData.nombre}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, nombre: e.target.value })
          }
          placeholder="Nombre de la categoría"
        />
      </div>
      <div>
        <label
          htmlFor="descripcion"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          placeholder="Descripción de la categoría"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`w-8 h-8 rounded-full ${color.class} border-2 transition-transform transform hover:scale-110 ${
                formData.color === color.value
                  ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-500'
                  : 'border-gray-200'
              }`}
              onClick={() => setFormData({ ...formData, color: color.value })}
              title={color.label}
            />
          ))}
        </div>
      </div>
      {errorMessage && (
        <div className="w-full flex items-center justify-center my-2 font-semibold text-red-600">
          <span>{errorMessage}</span>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <Button3 onClick={handleCancel}>Cancelar</Button3>
        <Button3 onClick={handleGuardarCategoria}>
          {category ? 'Actualizar' : 'Guardar'}
        </Button3>
      </div>
    </form>
  );
}
