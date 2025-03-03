import { useState, useMemo } from 'react';
import DivReact from '../../../../components/atomos/DivReact';

interface Cliente {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  categoria: string;
  estado: string;
  ultimaCompra: number;
}

export default function TablaClientes({ clientes: clientesIniciales }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    return clientesIniciales.filter(cliente => {
      const cumpleBusqueda = 
        cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.dni.includes(busqueda) ||
        cliente.telefono?.includes(busqueda);

      const cumpleCategoria = !filtroCategoria || cliente.categoria === filtroCategoria;
      const cumpleEstado = !filtroEstado || cliente.estado === filtroEstado;

      return cumpleBusqueda && cumpleCategoria && cumpleEstado;
    });
  }, [clientesIniciales, busqueda, filtroCategoria, filtroEstado]);

  return (
    <DivReact>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100/50"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100/50"
        >
          <option value="">Todas las categorías</option>
          <option value="VIP">VIP</option>
          <option value="regular">Regular</option>
          <option value="nuevo">Nuevo</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100/50"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Compra
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {cliente.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cliente.dni}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cliente.telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    cliente.categoria === 'VIP' 
                      ? 'bg-purple-100 text-purple-800' 
                      : cliente.categoria === 'regular'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {cliente.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    cliente.estado === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cliente.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cliente.ultimaCompra 
                    ? new Date(cliente.ultimaCompra * 1000).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a
                    href={`/dashboard/clientes/${cliente.id}`}
                    className="text-primary-100 hover:text-primary-100/80"
                  >
                    Ver perfil
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DivReact>
  );
} 