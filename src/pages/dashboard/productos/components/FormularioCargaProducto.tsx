import React, { useState, useEffect } from 'react';
import { showToast } from '../../../../utils/toast/toastShow';
import InputFile from '../../../../components/moleculas/InputFile';
import CategoriasSelector from './CategoriasSelector';
import Button3 from '../../../../components/atomos/Button3.jsx'; // Asumiendo que Button3 es un componente React
import Button5 from '../../../../components/atomos/Button5.jsx';

// Interfaces para las props
interface Deposito {
  id: string;
  nombre: string;
}
interface Ubicacion {
  id: string;
  nombre: string;
  depositoId: string;
}
interface Props {
  depositos: Deposito[];
  ubicaciones: Ubicacion[];
  userId: string;
  empresaId: string;
}

const FormularioCargaProducto: React.FC<Props> = ({ depositos, ubicaciones, userId, empresaId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigoBarra: '',
    descripcion: '',
    marca: '',
    modelo: '',
    depositoId: '',
    ubicacionId: '',
    pCompra: '',
    pVenta: '',
    iva: '21',
    stock: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoriasIds, setCategoriasIds] = useState<string[]>([]);
  const [filteredUbicaciones, setFilteredUbicaciones] = useState<Ubicacion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.depositoId) {
      const filtered = ubicaciones.filter(u => u.depositoId === formData.depositoId);
      setFilteredUbicaciones(filtered);
      setFormData(prev => ({ ...prev, ubicacionId: '' })); // Reset ubicacion on depot change
    } else {
      setFilteredUbicaciones([]);
    }
  }, [formData.depositoId, ubicaciones]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });
    submissionData.append('userId', userId);
    submissionData.append('empresaId', empresaId);
    submissionData.append('categoriasIds', JSON.stringify(categoriasIds));
    if (selectedFile) {
      submissionData.append('fotoProducto', selectedFile);
    }

    try {
      const response = await fetch('/api/productos/create', {
        method: 'POST',
        body: submissionData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Error en el servidor');
      }
      showToast('success', '¡Producto guardado con éxito!');
      // Reset form state here if needed
      window.location.reload(); // Or handle state update without reload
    } catch (err: any) {
      setError(err.message);
      showToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Agregar Nuevo Producto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* ... (resto del JSX del formulario) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Producto (Opcional)</label>
                    <InputFile name="fotoProducto" onFileChange={setSelectedFile} />
                </div>
                <div className="md:col-span-2 flex flex-col gap-4">
                    <div>
                        <label htmlFor="codigoBarra" className="block text-sm font-medium text-gray-700">Código de Barra</label>
                        <input type="text" name="codigoBarra" id="codigoBarra" value={formData.codigoBarra} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Color, tamaño, detalles..." required></textarea>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
                    <CategoriasSelector empresaId={empresaId} onCategoriasChange={setCategoriasIds} />
                </div>
                <div>
                    <label htmlFor="marca" className="block text-sm font-medium text-gray-700">Marca</label>
                    <input type="text" name="marca" id="marca" value={formData.marca} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">Modelo</label>
                    <input type="text" name="modelo" id="modelo" value={formData.modelo} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                    <label htmlFor="depositoId" className="block text-sm font-medium text-gray-700">Depósito</label>
                    <select id="depositoId" name="depositoId" value={formData.depositoId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="" disabled>Selecciona un depósito</option>
                        {depositos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="ubicacionId" className="block text-sm font-medium text-gray-700">Ubicación</label>
                    <select id="ubicacionId" name="ubicacionId" value={formData.ubicacionId} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" disabled={!formData.depositoId}>
                        <option value="" disabled>Selecciona una ubicación</option>
                        {filteredUbicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t pt-6">
                <div>
                    <label htmlFor="pCompra" className="block text-sm font-medium text-gray-700">Precio Compra</label>
                    <input type="number" name="pCompra" id="pCompra" value={formData.pCompra} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="pVenta" className="block text-sm font-medium text-gray-700">Precio Venta</label>
                    <input type="number" name="pVenta" id="pVenta" value={formData.pVenta} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="iva" className="block text-sm font-medium text-gray-700">IVA</label>
                    <select name="iva" value={formData.iva} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="21">21% IVA</option>
                        <option value="27">27% IVA</option>
                        <option value="10.5">10.5% IVA</option>
                        <option value="0">No Aplica</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Inicial</label>
                    <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <Button5 type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                </Button5>
            </div>
            {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
        </form>
    </div>
  );
};

export default FormularioCargaProducto;
