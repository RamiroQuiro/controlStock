export function puedeVerMenu(user, permiso) {
    if (!user) return false;
    if (user.rol === 'admin') return true;
  
    const permisosPorRol = {
      vendedor: ['ventas', 'clientes', 'stock'],
      repositor: ['stock', 'proveedores'],
    };
  
    const permisos = permisosPorRol[user.rol] || [];
    return permisos.includes(permiso.toLowerCase());
  }
  export const RUTAS_PROTEGIDAS = {
    '/dashboard/ajustes': ['admin'],
    '/dashboard': ['admin'],
    '/dashboard/compras': ['admin'],
    '/dashboard/ventas': ['admin', 'vendedor'],
    '/dashboard/clientes': ['admin', 'vendedor'],
    '/dashboard/stock': ['admin', 'repositor'],
    '/dashboard/proveedores': ['admin', 'repositor'],
  };
  
  export function puedeAccederRuta(user, pathname) {
    if (!user) return false;
    if (user.rol === 'admin') return true;
    const permitidos = RUTAS_PROTEGIDAS[pathname] || [];
    return permitidos.includes(user.rol);
  }