import { generateId } from "lucia";
import { roles } from "../db/schema/roles";
import db from "../db";
import { and, eq } from "drizzle-orm";

type RolInicial = {
    nombre: string;
    descripcion: string;
    permisos: string[];
  };
  
// Roles iniciales
export const ROLES_INICIALES:RolInicial[] = [
    {
      nombre: "admin",
      descripcion: "Administrador con acceso total",
      permisos: [
        'crear_usuarios', 'editar_usuarios', 'eliminar_usuarios',
        'crear_productos', 'editar_productos', 'eliminar_productos',
        'crear_ventas', 'anular_ventas', 'ver_reportes'
      ]
    },
    {
      nombre: "vendedor",
      descripcion: "Rol para personal de ventas",
      permisos: [
        'crear_ventas', 
        'ver_productos', 
        'ver_clientes',
        'consultar_stock'
      ]
    },
    {
      nombre: "repositorio",
      descripcion: "Gestión de inventario y stock",
      permisos: [
        'crear_productos', 
        'editar_productos',
        'ver_stock', 
        'ajustar_inventario'
      ]
    }
  ];

export async function inicializarRoles(userId: string) {
  try {
    // Verificar si ya existen roles
    const existenRoles = await db.select().from(roles).where(and(
        eq(roles.nombre, 'admin'),
        eq(roles.nombre, 'vendedor'),
        eq(roles.nombre, 'repositorio'),
        eq(roles.creadoPor,userId)
    ))
    
    if (existenRoles.length > 0) {
      return existenRoles; // Ya inicializado
    }

    // Insertar roles iniciales
    const rolesCreados = await db.insert(roles).values(
      ROLES_INICIALES.map(rol => ({
        id: generateId(10),
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: JSON.stringify(rol.permisos),
        creadoPor: userId
      }))
    ).returning();

    return rolesCreados;
  } catch (error) {
    console.error('Error al inicializar roles:', error);
    throw error;
  }
}
