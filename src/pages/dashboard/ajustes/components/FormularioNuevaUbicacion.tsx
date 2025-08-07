import React, { useState, useEffect } from "react";
import Button3 from "../../../../components/atomos/Button3";
import { showToast } from "../../../../utils/toast/toastShow.js";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx.jsx";
import { loader } from "../../../../utils/loader/showLoader.js";

// Interfaz para los datos de una ubicación
interface Ubicacion {
  id?: string;
  nombre: string;
  descripcion: string;
  depositoId: string;
  zona: string;
  pasillo: number;
  estante: number;
  rack: number;
  nivel: number;
  capacidadTotal: number;
}

// Interfaz para la lista de depósitos que pasaremos como prop
interface DepositoInfo {
    id: string;
    nombre: string;
}

// Props que el componente puede recibir
interface Props {
  ubicacion?: Ubicacion; // Opcional, para modo edición
  depositos: DepositoInfo[]; // Lista de depósitos para el selector
  onSave: () => void; // Callback para cuando se guarda exitosamente
  onCancel: () => void; // Callback para el botón de cancelar
  handleUbicacionAgregada: (ubicacion: any) => void;
}

export default function FormularioNuevaUbicacion({ ubicacion, depositos, onSave, onCancel ,handleUbicacionAgregada}: Props) {
  const [formData, setFormData] = useState<Ubicacion>({
    id: "",
    nombre: "",
    descripcion: "",
    depositoId: "",
    zona: "",
    pasillo: 0,
    estante: 0,
    rack: 0,
    nivel: 0,
    capacidadTotal: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Si se pasa una ubicación (modo edición), actualizamos el estado del formulario
  useEffect(() => {
    if (ubicacion) {
      setFormData(ubicacion);
    }
  }, [ubicacion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['pasillo', 'estante', 'rack', 'nivel', 'capacidadTotal'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) || 0 : value }));
  };

  const handleGuardarUbicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.depositoId) {
      setErrorMessage("El nombre y el depósito son obligatorios.");
      return;
    }

    try {
      const response = await fetch("/api/ubicaciones", {
        method: ubicacion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    
      const data = await response.json();
    
      if (response.ok) {
        showToast("success", data.msg || (ubicacion ? "Ubicación actualizada" : "Ubicación creada"));
        setErrorMessage(""); // Limpiar errores anteriores si los hubo
        handleUbicacionAgregada(data.data);
      } else {
        setErrorMessage(data.msg || "Ocurrió un error inesperado.");
        showToast("error", data.msg || "Ocurrió un error inesperado.");
      }
    } catch (error) {
      console.error("Error al guardar la ubicación:", error);
      setErrorMessage("No se pudo conectar con el servidor.");
      showToast("error", "No se pudo conectar con el servidor.");
    }
    
    loader(false);
  };


  return (
    <form onSubmit={handleGuardarUbicacion} className="flex flex-col gap-4 p-6 bg-white rounded-lg w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">{ubicacion ? "Editar Ubicación" : "Crear Nueva Ubicación"}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <InputComponenteJsx id="nombre" name="nombre" value={formData.nombre} handleChange={handleChange} placeholder="Ej: Fila A-1"  />
          
        </div>
        <div>
          <label htmlFor="depositoId" className="block text-sm font-medium text-gray-700 mb-1">Depósito</label>
          <select id="depositoId" name="depositoId" value={formData.depositoId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" required>
            <option value="" disabled>Selecciona un depósito</option>
            {depositos?.length === 0 && (
              <option value="" disabled>No hay depósitos disponibles</option>
            )}
            {depositos?.map(depot => (
              <option key={depot.id} value={depot.id}>{depot.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea id="descripcion" name="descripcion" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" value={formData.descripcion} onChange={handleChange} placeholder="Información adicional sobre la ubicación" />
      </div>

         <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
          <InputComponenteJsx placeholder="Zona o área (ej: Zona A, Refrigeración)" id="zona" name="zona" type="text" value={formData.zona} handleChange={handleChange} />
        </div>
      <p className="text-sm font-medium text-gray-700 -mb-2">Localizacion</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div>
          <label htmlFor="pasillo" className="block text-xs text-gray-600">Pasillo</label>
          <InputComponenteJsx placeholder="Pasillo" id="pasillo" name="pasillo" type="number" value={formData.pasillo} handleChange={handleChange} />
        </div>
        <div>
          <label htmlFor="estante" className="block text-xs text-gray-600">Estante</label>
          <InputComponenteJsx id="estante" name="estante" type="number" value={formData.estante} handleChange={handleChange} />
        </div>
        <div>
          <label htmlFor="rack" className="block text-xs text-gray-600">Rack</label>
          <InputComponenteJsx id="rack" name="rack" type="number" value={formData.rack} handleChange={handleChange} />
        </div>
        <div>
          <label htmlFor="nivel" className="block text-xs text-gray-600">Nivel</label>
          <InputComponenteJsx id="nivel" name="nivel" type="number" value={formData.nivel} handleChange={handleChange} />
        </div>
      </div>

      <div>
        <label htmlFor="capacidadTotal" className="block text-sm font-medium text-gray-700 mb-1">Capacidad Total (unidades)</label>
        <InputComponenteJsx id="capacidadTotal" name="capacidadTotal" type="number" value={formData.capacidadTotal} handleChange={handleChange} placeholder="Ej: 100" />
      </div>

      {errorMessage && (
        <div className="text-red-600 text-sm text-center p-2 bg-red-100 rounded-md">
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button3 onClick={onCancel}>Cancelar</Button3>
        <Button3 onClick={handleGuardarUbicacion}>{ubicacion ? "Actualizar" : "Guardar"}</Button3>
      </div>
    </form>
  );
}