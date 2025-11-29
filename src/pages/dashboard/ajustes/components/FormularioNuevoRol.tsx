// src/pages/dashboard/ajustes/components/FormularioNuevoRol.tsx
import { useState } from "react";
import { PERMISOS } from "../../../../modules/users/types/permissions";

// Agrupar permisos por categoría para el UI
const PERMISOS_DISPONIBLES = {
  "Gestión de Stock": [
    { key: PERMISOS.STOCK_VER, label: "Ver Stock" },
    { key: PERMISOS.PRODUCTOS_CREAR, label: "Crear Productos" },
    { key: PERMISOS.PRODUCTOS_EDITAR, label: "Editar Productos" },
    { key: PERMISOS.PRODUCTOS_ELIMINAR, label: "Eliminar Productos" },
  ],
  Ventas: [
    { key: PERMISOS.VENTAS_CREAR, label: "Crear Ventas" },
    { key: PERMISOS.VENTAS_VER_REPORTES, label: "Ver Reportes de Ventas" },
  ],
  Compras: [
    { key: PERMISOS.ORDEN_COMPRA_CREAR, label: "Crear Órdenes de Compra" },
    { key: PERMISOS.ORDEN_COMPRA_VER, label: "Ver Órdenes de Compra" },
  ],
  Traslados: [
    { key: PERMISOS.TRASLADO_CREAR, label: "Crear Traslados" },
    { key: PERMISOS.TRASLADO_VER, label: "Ver Traslados" },
    { key: PERMISOS.TRASLADO_EDITAR, label: "Editar Traslados" },
    { key: PERMISOS.TRASLADO_RECIBIR, label: "Recibir Traslados" },
  ],
  "Clientes y Proveedores": [
    { key: PERMISOS.CLIENTES_VER, label: "Ver Clientes" },
    { key: PERMISOS.PROVEEDORES_VER, label: "Ver Proveedores" },
  ],
  Administración: [
    { key: PERMISOS.USUARIOS_CREAR, label: "Crear Usuarios" },
    { key: PERMISOS.EMPRESA_CONFIG, label: "Configurar Empresa" },
  ],
};

export default function FormularioNuevoRol() {
  const [nombreRol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    []
  );

  const handlePermisoToggle = (permiso: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permiso)
        ? prev.filter((p) => p !== permiso)
        : [...prev, permiso]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/roles/createRol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreRol,
          descripcion,
          permisos: permisosSeleccionados,
        }),
      });

      const result = await response.json();

      if (result.status === 201) {
        alert("Rol creado exitosamente");
        window.location.reload();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error al crear rol", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">Crear Nuevo Rol</h2>

      <div>
        <label className="block mb-2 font-medium">Nombre del Rol</label>
        <input
          type="text"
          value={nombreRol}
          onChange={(e) => setNombreRol(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ej: Gerente de Ventas"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Describe las responsabilidades de este rol"
          rows={3}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Permisos</h3>
        {Object.entries(PERMISOS_DISPONIBLES).map(([seccion, permisos]) => (
          <div key={seccion} className="mb-4">
            <h4 className="font-medium mb-2 text-primary-100">{seccion}</h4>
            <div className="grid grid-cols-2 gap-2">
              {permisos.map((permiso) => (
                <label
                  key={permiso.key}
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={permisosSeleccionados.includes(permiso.key)}
                    onChange={() => handlePermisoToggle(permiso.key)}
                    className="mr-2"
                  />
                  <span className="text-sm">{permiso.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="bg-primary-100 text-white px-4 py-2 rounded hover:bg-primary-200 w-full"
      >
        Crear Rol
      </button>
    </form>
  );
}
