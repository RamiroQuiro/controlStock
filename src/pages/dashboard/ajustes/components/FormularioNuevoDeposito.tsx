import React, { useState, useEffect } from "react";
import Button3 from "../../../../components/atomos/Button3";
import { showToast } from "../../../../utils/toast/toastShow.js";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx.jsx";

// Interfaz que define la estructura de datos de un depósito
interface Deposito {
  id?: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  encargado: string;
  capacidadTotal: number;
}

// Props que el componente puede recibir
interface Props {
  deposito?: Deposito; // Opcional, para modo edición
  onSave: () => void; // Callback para cuando se guarda exitosamente
  onCancel: () => void; // Callback para el botón de cancelar
}

export default function FormularioNuevoDeposito({ deposito, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<Deposito>({
    id: "",
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    encargado: "",
    capacidadTotal: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Si se pasa un depósito (modo edición), actualizamos el estado del formulario
  useEffect(() => {
    if (deposito) {
      setFormData(deposito);
    }
  }, [deposito]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarDeposito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setErrorMessage("El nombre es obligatorio.");
      return;
    }

    try {
      const response = await fetch("/api/depositos", {
        method: deposito ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("success", data.msg || (deposito ? "Depósito actualizado" : "Depósito creado"));
        onSave(); // Ejecutamos el callback para cerrar el modal y refrescar
      } else {
        setErrorMessage(data.msg || "Ocurrió un error");
        showToast("error", data.msg || "Ocurrió un error");
      }
    } catch (error) {
      console.error("Error al guardar el depósito:", error);
      setErrorMessage("No se pudo conectar con el servidor.");
      showToast("error", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <form onSubmit={handleGuardarDeposito} className="flex flex-col gap-4 p-6 bg-white rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">{deposito ? "Editar Depósito" : "Crear Nuevo Depósito"}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <InputComponenteJsx id="nombre" name="nombre" value={formData.nombre} handleChange={handleChange} placeholder="Ej: Depósito Central" required />
        </div>
        <div>
          <label htmlFor="encargado" className="block text-sm font-medium text-gray-700 mb-1">Encargado</label>
          <InputComponenteJsx id="encargado" name="encargado" value={formData.encargado} handleChange={handleChange} placeholder="Ej: Juan Pérez" />
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea id="descripcion" name="descripcion" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" value={formData.descripcion} onChange={handleChange} placeholder="Información adicional sobre el depósito" />
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <InputComponenteJsx id="direccion" name="direccion" value={formData.direccion} handleChange={handleChange} placeholder="Ej: Av. Siempre Viva 123" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <InputComponenteJsx id="telefono" name="telefono" type="tel" value={formData.telefono} handleChange={handleChange} placeholder="Ej: +54 9 11 1234-5678" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <InputComponenteJsx id="email" name="email" type="email" value={formData.email} handleChange={handleChange} placeholder="Ej: contacto@deposito.com" />
        </div>
      </div>

      <div>
        <label htmlFor="capacidadTotal" className="block text-sm font-medium text-gray-700 mb-1">Capacidad Total (unidades)</label>
        <InputComponenteJsx id="capacidadTotal" name="capacidadTotal" type="number" value={formData.capacidadTotal} handleChange={handleChange} placeholder="Ej: 10000" />
      </div>

      {errorMessage && (
        <div className="text-red-600 text-sm text-center p-2 bg-red-100 rounded-md">
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button3 onClick={onCancel}>Cancelar</Button3>
        <Button3 onClick={handleGuardarDeposito}>{deposito ? "Actualizar" : "Guardar"}</Button3>
      </div>
    </form>
  );
}
