export const PERMISOS = {
  // Usuarios y Roles
  USUARIOS_VER: "ver_usuarios",
  USUARIOS_CREAR: "crear_usuarios",
  USUARIOS_EDITAR: "editar_usuarios",
  USUARIOS_ELIMINAR: "eliminar_usuarios",
  ROLES_VER: "ver_roles",
  ROLES_CREAR: "crear_roles",
  ROLES_EDITAR: "editar_roles",

  // Productos y Stock
  PRODUCTOS_VER: "ver_productos",
  PRODUCTOS_CREAR: "crear_productos",
  PRODUCTOS_EDITAR: "editar_productos",
  PRODUCTOS_ELIMINAR: "eliminar_productos",
  STOCK_VER: "ver_stock",
  STOCK_AJUSTAR: "ajustar_inventario", // Ajustes manuales, ingresos/egresos

  // Ventas
  VENTAS_CREAR: "crear_ventas",
  VENTAS_EDITAR: "editar_ventas",
  VENTAS_ANULAR: "anular_ventas",
  VENTAS_VER_REPORTES: "ver_reportes", // Ver dashboard financiero

  // Clientes y Proveedores
  CLIENTES_VER: "ver_clientes",
  PROVEEDORES_VER: "ver_proveedores",

  // Compras
  ORDEN_COMPRA_CREAR: "crear_orden_compra",
  ORDEN_COMPRA_VER: "ver_orden_compra",

  // Configuración
  EMPRESA_CONFIG: "configurar_empresa",
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

export interface UsuarioConRol {
  id: string;
  rol: string; // 'admin' | 'vendedor' | 'repositor'
  permisos?: string[]; // Array de strings con los permisos
}
