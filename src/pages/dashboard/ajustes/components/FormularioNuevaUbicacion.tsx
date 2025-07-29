import React, { useState } from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import Button3 from "../../../../components/atomos/Button3.jsx";
import { showToast } from "../../../../utils/toast/toastShow.js";

interface Ubicacion {
  id: string;
  nombre: string;
  descripcion: string;
}

type Props = {
  setIsDialogOpen: (isOpen: boolean) => void;
  ubicacion: Ubicacion;
};

export default function FormularioNuevaUbicacion({ ubicacion }: Props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    id: ubicacion?.id || "",
    nombre: ubicacion?.nombre || "",
    descripcion: ubicacion?.descripcion || "",
  });

  const handleGuardarUbicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    try {
      const fecthNewUbi = await fetch("/api/ubicaciones", {
        method: ubicacion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await fecthNewUbi.json();
      if (data.status === 200) {
        showToast("success", data.msg);
      } else {
        setErrorMessage(data.msg);
        showToast("error", data.msg);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <form className="flex flex-col gap-4 items justify-center w-full p-10">
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
          placeholder="Nombre de la ubicación"
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
          placeholder="Descripción de la ubicación"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          rows={3}
        />
      </div>
      {errorMessage && (
        <div className="w-full flex items-center justify-center my-2 font-semibold text-red-600">
          <span>{errorMessage}</span>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <Button3 onClick={handleCancel}>Cancelar</Button3>
        <Button3 onClick={handleGuardarUbicacion}>
          {ubicacion ? "Actualizar" : "Guardar"}
        </Button3>
      </div>
    </form>
  );
}
