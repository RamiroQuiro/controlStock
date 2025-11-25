import {
  PERMISOS,
  type UsuarioConRol,
  type Permiso,
} from "../types/permissions";

/**
 * Verifica si un usuario tiene un permiso específico.
 * Soporta modo legacy (admin tiene todo) y modo granular.
 */
export function tienePermiso(
  usuario: UsuarioConRol | null | undefined,
  permiso: Permiso
): boolean {
  if (!usuario) return false;

  // 1. Superadmin / Admin siempre tiene acceso total
  if (usuario.rol === "admin") return true;

  // 2. Si el usuario tiene permisos explícitos (cargados desde DB)
  if (usuario.permisos && Array.isArray(usuario.permisos)) {
    return usuario.permisos.includes(permiso);
  }

  // 3. Fallback: Mapeo de roles legacy a permisos (mientras migramos)
  // Esto asegura que el sistema siga funcionando antes de migrar todos los usuarios a la tabla de roles
  const permisosRolLegacy: Record<string, string[]> = {
    vendedor: [
      PERMISOS.VENTAS_CREAR,
      PERMISOS.VENTAS_EDITAR,
      PERMISOS.CLIENTES_VER,
      PERMISOS.PRODUCTOS_VER,
      PERMISOS.STOCK_VER, // Ahora permitimos ver stock
    ],
    repositor: [
      PERMISOS.STOCK_VER,
      PERMISOS.PRODUCTOS_VER,
      PERMISOS.PRODUCTOS_CREAR,
      PERMISOS.PRODUCTOS_EDITAR,
      PERMISOS.PROVEEDORES_VER,
      PERMISOS.STOCK_AJUSTAR,
    ],
  };

  const permisosDelRol = permisosRolLegacy[usuario.rol] || [];
  return permisosDelRol.includes(permiso);
}

/**
 * Hook-like helper para usar en componentes (si se necesita lógica extra)
 */
export function usePermiso(usuario: UsuarioConRol | null) {
  return {
    puede: (permiso: Permiso) => tienePermiso(usuario, permiso),
  };
}
