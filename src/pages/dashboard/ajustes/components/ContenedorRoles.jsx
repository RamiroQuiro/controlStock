import { Edit, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import BotonEditar from "../../../../components/moleculas/BotonEditar";
import BotonEliminar from "../../../../components/moleculas/BotonEliminar";
import FormularioEditarRol from "./FormularioEditarRol";

export default function ContenedorRoles({ roles = [] }) {
  const [editingRol, setEditingRol] = useState(null);

  // Filtrar solo roles personalizados (que tienen permisos y descripcion)
  const rolesPersonalizados = roles.filter((rol) => rol.permisos);

  if (rolesPersonalizados.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay roles personalizados creados.</p>
        <p className="text-sm mt-2">
          Crea un nuevo rol usando el botón "+ Nuevo Rol"
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {rolesPersonalizados.map((rol) => {
          // Parsear permisos de forma segura
          let permisosArray = [];
          try {
            if (Array.isArray(rol.permisos)) {
              permisosArray = rol.permisos;
            } else if (typeof rol.permisos === "string") {
              permisosArray = JSON.parse(rol.permisos);
            }
          } catch (e) {
            console.error("Error parsing permisos:", e);
            permisosArray = [];
          }

          return (
            <div key={rol.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-primary-textoTitle">
                  {rol.nombre || rol.name}
                </h3>
                <div className="flex space-x-2">
                  <div onClick={() => setEditingRol(rol)}>
                    <BotonEditar />
                  </div>
                  <BotonEliminar />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {rol.descripcion || "Sin descripción"}
              </p>
              <div className="flex flex-wrap gap-2">
                {permisosArray.map((permiso, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-100 text-white text-xs px-2 py-1 rounded-full"
                  >
                    {permiso}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Edición */}
      {editingRol && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setEditingRol(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <FormularioEditarRol
              rol={editingRol}
              onClose={() => setEditingRol(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
