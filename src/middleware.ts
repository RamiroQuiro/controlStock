import { lucia } from "../src/lib/auth";
import { defineMiddleware } from "astro/middleware";
import { verifyRequestOrigin } from "lucia";
import { PUBLIC_ROUTES } from "./lib/protectRoutes";
import jwt from "jsonwebtoken";
import { PERMISOS } from "./modules/users/types/permissions";

type UserData = {
  id: number;
  nombre: string;
  apellido: string;
  userName: string;
  email: string;
  rol: string;
  rolPersonalizadoId?: string | null;
  permisos?: string[];
};

// 🔧 MEJORA: Definir rutas públicas de forma más eficiente
const PUBLIC_PATHS = new Set([
  "/api/auth/",
  "/api/tienda/",
  "/tienda/",
  "/verificar-email/",
  "/login",
  "/registro",
  "/recuperar-password",
  "/reenviar-confirmacion",
  "/api/auth/reenviar-verificacion",
  "/api/public/",
  "/catalogo/",
]);

// 🔧 MEJORA: Cache para evitar imports dinámicos repetidos
let permissionsUtils: any = null;

async function getPermissionsUtils() {
  if (!permissionsUtils) {
    permissionsUtils = await import("./modules/users/utils/permissions");
  }
  return permissionsUtils;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies } = context;
  const pathname = url.pathname;

  // ✅ MEJORA: Verificación más eficiente de rutas públicas
  const isPublicRoute =
    Array.from(PUBLIC_PATHS).some((publicPath) =>
      pathname.startsWith(publicPath)
    ) || PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return next();
  }

  // ✅ MEJORA: Verificación CSRF más robusta
  if (request.method !== "GET") {
    const originHeader = request.headers.get("Origin");
    const hostHeader = request.headers.get("Host");

    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new Response("Forbidden - CSRF detected", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  // 🔧 MEJORA: Verificar sesión y usuario de forma más eficiente
  const sessionId = cookies.get(lucia.sessionCookieName)?.value;
  const userDataCookie = cookies.get("userData")?.value;

  if (!sessionId || !userDataCookie) {
    return context.redirect("/login");
  }

  try {
    // Validar sesión
    const { session, user: luciaUser } = await lucia.validateSession(sessionId);

    if (!session) {
      // Limpiar cookies inválidas
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      cookies.delete("userData");

      return context.redirect("/login");
    }

    // Renovar sesión si es necesario
    if (session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    // 🔧 MEJORA: Decodificación más segura del usuario
    let user: UserData;
    try {
      user = jwt.verify(
        userDataCookie,
        import.meta.env.SECRET_KEY_CREATECOOKIE
      ) as UserData;
    } catch (jwtError) {
      console.error("Token JWT inválido:", jwtError);
      cookies.delete("userData");
      return context.redirect("/login");
    }

    // ✅ MEJORA: Sistema de permisos más robusto
    const permisosRequeridos: Record<string, string> = {
      "/dashboard/stock": PERMISOS.STOCK_VER,
      "/dashboard/ventas": PERMISOS.VENTAS_CREAR,
      "/dashboard/compras": PERMISOS.ORDEN_COMPRA_VER,
      "/dashboard/proveedores": PERMISOS.PROVEEDORES_VER,
      "/dashboard/clientes": PERMISOS.CLIENTES_VER,
      "/dashboard/configuracion": PERMISOS.EMPRESA_CONFIG,
      "/dashboard/usuarios": PERMISOS.USUARIOS_VER,
      "/dashboard/roles": PERMISOS.ROLES_VER,
    };

    // 🔧 MEJORA: Búsqueda más eficiente del permiso requerido
    const permisoRequerido = Object.entries(permisosRequeridos).find(
      ([route]) => pathname.startsWith(route)
    )?.[1];

    if (permisoRequerido) {
      const { tienePermiso } = await getPermissionsUtils();

      const usuarioConRol = {
        ...user,
        id: String(user.id),
        rol: user.rol || "vendedor",
        permisos: user.permisos || [],
      };

      if (!tienePermiso(usuarioConRol, permisoRequerido)) {
        // 🔧 MEJORA: Redirección inteligente basada en permisos
        return redirectSegunRol(user.rol, context);
      }
    }

    // ✅ MEJORA: Validación adicional para rutas de dashboard
    if (pathname.startsWith("/dashboard") && !permisoRequerido) {
      // Si es una ruta de dashboard sin permiso definido, verificar acceso básico
      const rolesPermitidos = ["admin", "manager", "vendedor", "repositor"];
      if (!rolesPermitidos.includes(user.rol)) {
        return context.redirect("/acceso-denegado");
      }
    }

    // Establecer contexto
    context.locals.user = user;
    context.locals.session = session;

    return next();
  } catch (error) {
    console.error("Error crítico en middleware:", error);

    // Limpiar cookies en caso de error
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    cookies.delete("userData");

    return context.redirect("/login");
  }
});

// 🔧 MEJORA: Función auxiliar para redirección inteligente
function redirectSegunRol(rol: string, context: any) {
  const redirecciones: Record<string, string> = {
    vendedor: "/dashboard/ventas",
    repositor: "/dashboard/stock",
    comprador: "/dashboard/compras",
    admin: "/dashboard",
    manager: "/dashboard",
  };

  const redireccion = redirecciones[rol] || "/acceso-denegado";
  return context.redirect(redireccion);
}
