// src/pages/dashboard/ajustes/components/FormularioNuevoRol.tsx
import { useState } from 'react';

// Definir permisos disponibles
const PERMISOS_DISPONIBLES = {
  usuarios: [
    'crear_usuarios', 
    'editar_usuarios', 
    'eliminar_usuarios', 
    'ver_usuarios'
  ],
  productos: [
    'crear_productos', 
    'editar_productos', 
    'eliminar_productos', 
    'ver_productos'
  ],
  ventas: [
    'crear_ventas', 
    'ver_ventas', 
    'anular_ventas'
  ]
};

export default function FormularioNuevoRol() {
  const [nombreRol, setNombreRol] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);

  const handlePermisoToggle = (permiso: string) => {
    setPermisosSeleccionados(prev => 
      prev.includes(permiso) 
        ? prev.filter(p => p !== permiso)
        : [...prev, permiso]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/roles/createRol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: nombreRol,
          descripcion,
          permisos: permisosSeleccionados
        })
      });

      const result = await response.json();
      
      if (result.status === 201) {
        // Lógica de éxito
        alert('Rol creado exitosamente');
      } else {
        // Manejar errores
        alert(result.message);
      }
    } catch (error) {
      console.error('Error al crear rol', error);
    }
  };
// En un componente o página

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Nombre del Rol</label>
        <input 
          type="text"
          value={nombreRol}
          onChange={(e) => setNombreRol(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-2">Descripción</label>
        <textarea 
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Permisos</h3>
        {Object.entries(PERMISOS_DISPONIBLES).map(([seccion, permisos]) => (
          <div key={seccion} className="mb-4">
            <h4 className="font-medium mb-2 capitalize">{seccion}</h4>
            <div className="flex flex-wrap gap-2">
              {permisos.map((permiso) => (
                <label key={permiso} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={permisosSeleccionados.includes(permiso)}
                    onChange={() => handlePermisoToggle(permiso)}
                    className="mr-2"
                  />
                  {permiso.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        type="submit" 
        className="bg-primary-100 text-white px-4 py-2 rounded hover:bg-primary-200"
      >
        Crear Rol
      </button>
    </form>
  );
}