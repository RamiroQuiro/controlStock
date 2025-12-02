import { generateId } from "lucia";
import { roles } from "../db/schema/roles";
import db from "../db";
import { and, eq } from "drizzle-orm";
import { normalizadorUUID } from "../utils/normalizadorUUID";

type RolInicial = {
  nombre: string;
  descripcion: string;
  permisos: string[];
};

// Roles iniciales
export const ROLES_INICIALES: RolInicial[] = [
  {
    id: "rolAdmin",
    nombre: "admin",
    descripcion: "Administrador con acceso total",
    permisos: [
      "crear_usuarios",
      "editar_usuarios",
      "eliminar_usuarios",
      "crear_productos",
      "editar_productos",
      "eliminar_productos",
      "crear_ventas",
      "anular_ventas",
      "editar_ventas",
      "crear_presupuestos",
      "ver_presupuestos",
      "ver_reportes",
      "configurar_empresa",
      "ver_roles",
      "crear_roles",
      "editar_roles",
    ],
  },
  {
    id: "rolVendedor",
    nombre: "vendedor",
    descripcion: "Rol para personal de ventas",
    permisos: [
      "crear_ventas",
      "editar_ventas",
      "anular_ventas",
      "crear_presupuestos",
      "ver_presupuestos",
      "ver_productos",
      "ver_clientes",
      "ver_stock",
    ],
  },
  {
    id: "rolRepositorio",
    nombre: "repositorio",
    descripcion: "Gestión de inventario y stock",
    permisos: [
      "crear_productos",
      "editar_productos",
      "ver_productos",
      "ver_stock",
      "ajustar_inventario",
      "ver_proveedores",
      "crear_orden_compra",
      "ver_orden_compra",
    ],
  },
];

export async function inicializarRoles(userId: string, empresaId: string) {
  try {
    // Verificar si al menos uno de los roles ya fue creado
    const rolesExistentes = await db
      .select()
      .from(roles)
      .where(eq(roles.empresaId, empresaId));

    const nombresExistentes = rolesExistentes.map((r) => r.nombre);

    const rolesFaltantes = ROLES_INICIALES.filter(
      (rol) => !nombresExistentes.includes(rol.nombre)
    );

    if (rolesFaltantes.length === 0) {
      return rolesExistentes;
    }

    // Insertar los que faltan
    const nuevosRoles = await db
      .insert(roles)
      .values(
        rolesFaltantes.map((rol) => ({
          id: normalizadorUUID(`rol-${empresaId}`, 7),
          nombre: rol.nombre,
          empresaId,
          descripcion: rol.descripcion,
          permisos: JSON.stringify(rol.permisos),
          creadoPor: userId,
        }))
      )
      .returning();

    return [...rolesExistentes, ...nuevosRoles];
  } catch (error) {
    console.error("Error al inicializar roles:", error);
    throw error;
  }
}
