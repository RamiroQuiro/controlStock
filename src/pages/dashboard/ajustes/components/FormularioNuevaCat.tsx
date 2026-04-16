import React, { useState } from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import { showToast } from "../../../../utils/toast/toastShow.js";
import { categoriasStore } from "../../../../context/store.js";
import type { Categoria } from "../../../../types/index.js";
import LoaderReact from "../../../../utils/loader/LoaderReact.jsx";
import Button from "../../../../components/atomos/Button";

interface Category {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
}

type Props = {
  setIsDialogOpen?: (isOpen: boolean) => void;
  category?: Category;
  onClose: () => void;
  onCategoriaCreada?: (categoria: any) => void;
};

export default function FormularioNuevaCategoria({
  category,
  onClose,
  onCategoriaCreada,
}: Props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: category?.id || "",
    nombre: category?.nombre || "",
    descripcion: category?.descripcion || "",
    color: category?.color || "bg-blue-500",
  });

  const colorOptions = [
    { value: "bg-blue-500", label: "Azul", class: "bg-blue-500" },
    { value: "bg-green-500", label: "Verde", class: "bg-green-500" },
    { value: "bg-purple-500", label: "Morado", class: "bg-purple-500" },
    { value: "bg-red-500", label: "Rojo", class: "bg-red-500" },
    { value: "bg-yellow-500", label: "Amarillo", class: "bg-yellow-500" },
    { value: "bg-orange-500", label: "Naranja", class: "bg-orange-500" },
  ];

  const handleGuardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    try {
      setLoading(true);
      const fecthNewCat = await fetch("/api/categorias/", {
        method: category?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await fecthNewCat.json();
      if (data.status === 200) {
        showToast(category ? "Categoría actualizada" : "Categoría creada", {
          background: "bg-green-500",
        });

        const currentStore = categoriasStore.get();
        const currentData = Array.isArray(currentStore.data)
          ? currentStore.data
          : [];

        let updatedData;
        const savedCategory = data.data;

        if (category) {
          // Modo edición: reemplazar elemento
          updatedData = currentData.map((cat: any) =>
            cat.id === savedCategory.id ? savedCategory : cat,
          );
        } else {
          // Modo creación: añadir elemento
          updatedData = [...currentData, savedCategory];
        }

        categoriasStore.set({
          ...currentStore,
          data: updatedData as any,
          loading: false,
        });

        if (onCategoriaCreada) {
          onCategoriaCreada(savedCategory);
        }

        if (onClose) onClose();
      } else {
        setErrorMessage(data.msg);
        showToast("error al actualizar", { background: "bg-primary-400" });
      }
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e: Event) => {
    e.preventDefault();
    onClose();
  };

  return (
    <form className="flex flex-col gap-4 items justify-center w-full pb-6">
      {loading && <LoaderReact />}
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre
        </label>
        <InputComponenteJsx
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, nombre: e.target.value })
          }
          placeholder="Nombre de la categoría"
          disable={loading}
          tab={0}
          className=""
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
          disabled={loading}
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
                  ? "border-gray-800 ring-2 ring-offset-2 ring-gray-500"
                  : "border-gray-200"
              }`}
              onClick={() => setFormData({ ...formData, color: color.value })}
              title={color.label}
              disabled={loading}
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
        <Button
          className="hover:bg-primary-400/80 bg-primary-400 py-1 text-white"
          onClick={handleCancel}
          disabled={loading}
          isActive={false}
          id="btn-cancelar-cat"
        >
          Cancelar
        </Button>
        <Button
          className="hover:bg-primary-100/80 bg-primary-100 py-1 text-white"
          onClick={handleGuardarCategoria}
          disabled={loading}
          isActive={false}
          id="btn-guardar-cat"
        >
          {category ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
