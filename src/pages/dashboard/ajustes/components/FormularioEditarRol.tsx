import { useState, useEffect } from "react";
import { PERMISOS } from "../../../../modules/users/types/permissions";

// Agrupar permisos por categoría para el UI (Misma estructura que en crear)
const PERMISOS_DISPONIBLES = {
  "Gestión de Stock": [
    { key: PERMISOS.STOCK_VER, label: "Ver Stock" },
    { key: PERMISOS.PRODUCTOS_CREAR, label: "Crear Productos" },
    { key: PERMISOS.PRODUCTOS_EDITAR, label: "Editar Productos" },
    { key: PERMISOS.PRODUCTOS_ELIMINAR, label: "Eliminar Productos" },
    { key: PERMISOS.STOCK_AJUSTAR, label: "Ajustar Inventario" },
  ],
  Ventas: [
    { key: PERMISOS.VENTAS_CREAR, label: "Crear Ventas" },
    { key: PERMISOS.VENTAS_EDITAR, label: "Editar Ventas" },
    { key: PERMISOS.VENTAS_ANULAR, label: "Anular Ventas" },
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
    { key: PERMISOS.USUARIOS_VER, label: "Ver Usuarios" },
    { key: PERMISOS.USUARIOS_CREAR, label: "Crear Usuarios" },
    { key: PERMISOS.USUARIOS_EDITAR, label: "Editar Usuarios" },
    { key: PERMISOS.ROLES_VER, label: "Ver Roles" },
    { key: PERMISOS.ROLES_CREAR, label: "Crear Roles" },
    { key: PERMISOS.ROLES_EDITAR, label: "Editar Roles" },
    { key: PERMISOS.EMPRESA_CONFIG, label: "Configurar Empresa" },
  ],
};

interface Props {
  rol: {
    id: string;
    nombre: string;
    descripcion: string;
    permisos: string | string[];
  };
  onClose?: () => void;
}

export default function FormularioEditarRol({ rol, onClose }: Props) {
  const [nombreRol, setNombreRol] = useState(rol.nombre);
  const [descripcion, setDescripcion] = useState(rol.descripcion || "");
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    []
  );

  useEffect(() => {
    // Inicializar permisos
    let permisosArray: string[] = [];
    try {
      if (Array.isArray(rol.permisos)) {
        permisosArray = rol.permisos;
      } else if (typeof rol.permisos === "string") {
        permisosArray = JSON.parse(rol.permisos);
      }
    } catch (e) {
      console.error("Error parsing permisos:", e);
    }
    setPermisosSeleccionados(permisosArray);
  }, [rol]);

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
      const response = await fetch("/api/roles/updateRol", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: rol.id,
          nombre: nombreRol,
          descripcion,
          permisos: permisosSeleccionados,
        }),
      });

      const result = await response.json();

      if (result.status === 200) {
        alert("Rol actualizado exitosamente");
        window.location.reload();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error al actualizar rol", error);
      alert("Error al actualizar rol");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 text-primary-textoTitle"
    >
      <h2 className="text-xl font-semibold">Editar Rol: {rol.nombre}</h2>

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

      <div className="flex gap-4 justify-end">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="bg-primary-100 text-white px-4 py-2 rounded hover:bg-primary-200"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
