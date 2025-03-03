import { useState } from 'react';
import { showToast } from '../../../../utils/toast/toastShow';
import DivReact from '../../../../components/atomos/DivReact';

interface Cliente {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria: 'VIP' | 'regular' | 'nuevo';
  estado: 'activo' | 'inactivo';
  limiteCredito: number;
  observaciones: string;
}

export default function FormularioEdicion({ cliente }: { cliente: Cliente }) {
  const [formData, setFormData] = useState<Cliente>(cliente);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/clientes/${cliente.id}/actualizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar');
      }

      showToast('Cliente actualizado exitosamente', { background: 'bg-green-600' });
      window.location.href = `/dashboard/clientes/${cliente.id}`;
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al actualizar el cliente', { background: 'bg-red-600' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DivReact>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              DNI *
            </label>
            <input
              type="text"
              name="dni"
              required
              value={formData.dni}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            >
              <option value="nuevo">Nuevo</option>
              <option value="regular">Regular</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Límite de crédito
            </label>
            <input
              type="number"
              name="limiteCredito"
              value={formData.limiteCredito}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            rows={3}
            value={formData.observaciones}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
          />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.location.href = `/dashboard/clientes/${cliente.id}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-100 text-white rounded-md hover:bg-primary-100/80"
          >
            Guardar Cambios
          </button>
        </div>
      </DivReact>
    </form>
  );
} 