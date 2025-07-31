
import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/toast/toastShow';
import Button5 from './atomos/Button5';
import InputComponenteJsx from '../pages/dashboard/dashboard/componente/InputComponenteJsx';

// Interfaces
interface Categoria { id: string; nombre: string; }
interface Deposito { id: string; nombre: string; }
interface Ubicacion { id: string; nombre: string; depositoId: string; }

interface Props {
  userId: string;
  empresaId: string;
  onClose: () => void;
}

const initialFormData = {
  nombre: "",
  codigoBarra: "",
  descripcion: "",
  marca: "",
  modelo: "",
  depositoId: "",
  ubicacionId: "",
  pCompra: "",
  pVenta: "",
  iva: "21",
  stock: "",
  alertaStock: "",
};

export default function FormularioCrearProducto({ userId, empresaId, onClose }: Props) {
  const [formData, setFormData] = useState(initialFormData);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [filteredUbicaciones, setFilteredUbicaciones] = useState<Ubicacion[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, depRes, ubiRes] = await Promise.all([
          fetch(`/api/categorias?empresaId=${empresaId}`),
          fetch(`/api/depositos?empresaId=${empresaId}`),
          fetch(`/api/ubicaciones?empresaId=${empresaId}`),
        ]);
        const catData = await catRes.json();
        const depData = await depRes.json();
        const ubiData = await ubiRes.json();

        setCategorias(catData.data || []);
        setDepositos(depData.data || []);
        setUbicaciones(ubiData.data || []);
      } catch (err) {
        showToast('error', 'No se pudieron cargar los datos necesarios.');
        console.error(err);
      }
    };
    fetchData();
  }, [empresaId]);

  // Filtrar ubicaciones cuando cambia el depósito
  useEffect(() => {
    if (formData.depositoId) {
      setFilteredUbicaciones(ubicaciones.filter(u => u.depositoId === formData.depositoId));
    } else {
      setFilteredUbicaciones([]);
    }
    setFormData(prev => ({ ...prev, ubicacionId: '' }));
  }, [formData.depositoId, ubicaciones]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCategorias(values);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });
    submissionData.append("userId", userId);
    submissionData.append("empresaId", empresaId);
    submissionData.append("categoriasIds", JSON.stringify(selectedCategorias));
    // Aquí también deberías agregar el `selectedFile` si tienes un input de archivo

    try {
      const response = await fetch("/api/productos/create", {
        method: "POST",
        body: submissionData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "Error en el servidor");
      }
      showToast("success", "¡Producto guardado con éxito!");
      onClose(); // Cierra el modal y refresca la lista
    } catch (err: any) {
      setError(err.message);
      showToast("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputComponenteJsx label="Nombre del Producto" name="nombre" value={formData.nombre} handleChange={handleChange} required />
        <InputComponenteJsx label="Código de Barra" name="codigoBarra" value={formData.codigoBarra} handleChange={handleChange} />
      </div>
      
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputComponenteJsx label="Marca" name="marca" value={formData.marca} handleChange={handleChange} />
        <InputComponenteJsx label="Modelo" name="modelo" value={formData.modelo} handleChange={handleChange} />
      </div>

      <div className="p-4 border rounded-md">
        <h4 className="text-lg font-medium text-gray-800 mb-3">Ubicación y Stock</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="depositoId" className="block text-sm font-medium text-gray-700 mb-1">Depósito</label>
            <select name="depositoId" value={formData.depositoId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
              <option value="">Seleccione un depósito</option>
              {depositos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ubicacionId" className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <select name="ubicacionId" value={formData.ubicacionId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={!formData.depositoId}>
              <option value="">Seleccione una ubicación</option>
              {filteredUbicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
          <InputComponenteJsx label="Stock Inicial" name="stock" type="number" value={formData.stock} handleChange={handleChange} required />
          <InputComponenteJsx label="Alerta de Stock" name="alertaStock" type="number" value={formData.alertaStock} handleChange={handleChange} />
        </div>
      </div>
      
      <div className="p-4 border rounded-md">
         <h4 className="text-lg font-medium text-gray-800 mb-3">Precios e Impuestos</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputComponenteJsx label="Precio Compra" name="pCompra" type="number" value={formData.pCompra} handleChange={handleChange} required />
            <InputComponenteJsx label="Precio Venta" name="pVenta" type="number" value={formData.pVenta} handleChange={handleChange} required />
            <div>
              <label htmlFor="iva" className="block text-sm font-medium text-gray-700 mb-1">IVA</label>
              <select name="iva" value={formData.iva} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">
                <option value="21">21%</option>
                <option value="10.5">10.5%</option>
                <option value="27">27%</option>
                <option value="0">Exento</option>
              </select>
            </div>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm text-center">{error}</div>}

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
          Cancelar
        </button>
        <Button5 type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
        </Button5>
      </div>
    </form>
  );
}
