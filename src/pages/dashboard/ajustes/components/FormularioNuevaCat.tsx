import React, { useState } from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import Button3 from "../../../../components/atomos/Button3.jsx";

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
}

type Props = {
  setIsDialogOpen: (isOpen: boolean) => void;
};

export default function FormularioNuevaCategoria({ setIsDialogOpen }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
  });

  const colorOptions = [
    { value: "bg-blue-500", label: "Azul", class: "bg-blue-500" },
    { value: "bg-green-500", label: "Verde", class: "bg-green-500" },
    { value: "bg-purple-500", label: "Morado", class: "bg-purple-500" },
    { value: "bg-red-500", label: "Rojo", class: "bg-red-500" },
    { value: "bg-yellow-500", label: "Amarillo", class: "bg-yellow-500" },
    { value: "bg-orange-500", label: "Naranja", class: "bg-orange-500" },
  ];

  const handleSaveCategory = () => {
    if (!formData.name.trim()) return;
    // Aquí iría la lógica para guardar la nueva categoría
    console.log("Guardando categoría:", formData);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory(); }} className="flex flex-col gap-4 items justify-center w-full p-10">
      
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <InputComponenteJsx
            id="name"
            value={formData.name}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Nombre de la categoría"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, description: e.target.value })
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
                    ? "border-gray-800 ring-2 ring-offset-2 ring-gray-500"
                    : "border-gray-200"
                }`}
                onClick={() => setFormData({ ...formData, color: color.value })}
                title={color.label}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button3 variant="outline" onClick={handleCancel}>
            Cancelar
          </Button3>
          <Button3 type="submit">
            Crear Categoría
          </Button3>
        </div>
    </form>
  );
}