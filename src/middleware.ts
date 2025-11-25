import { lucia } from "../src/lib/auth";
import { defineMiddleware } from "astro/middleware";
import { verifyRequestOrigin } from "lucia";
import { PUBLIC_ROUTES } from "./lib/protectRoutes";
import jwt from "jsonwebtoken";

type UserData = {
  id: number;
  nombre: string;
  apellido: string;
  userName: string;
  email: string;
  rol: string;
};

export const onRequest = defineMiddleware(async (context, next) => {
  // Permitir todas las rutas de API de autenticación
  if (
    context.url.pathname.startsWith("/api/auth/") ||
    context.url.pathname.startsWith("/api/tienda/") ||
    context.url.pathname.startsWith("/tienda/") ||
    context.url.pathname.startsWith("/verificar-email/")
  ) {
    return next();
  }

  // Verificar origen de la solicitud para prevenir CSRF
  if (context.request.method !== "GET") {
    const originHeader = context.request.headers.get("Origin") ?? null;
    const hostHeader = context.request.headers.get("Host") ?? null;

    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new Response(null, {
        status: 403,
        statusText: "Forbidden",
      });
    }
  }

  // Verificar sesión para rutas protegidas
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
  const userDataCookie = context.cookies.get("userData")?.value ?? null;
  // Rutas públicas siempre accesibles
  if (PUBLIC_ROUTES.includes(context.url.pathname)) {
    return next();
  }

  // Verificar sesión para rutas que requieren autenticación
  if (!sessionId) {
    return context.redirect("/login");
  }

  try {
    const { session } = await lucia.validateSession(sessionId);

    // Renovar sesión si es necesario
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    let user: UserData | null = null;

    // Decodificar la cookie de usuario
    if (userDataCookie) {
      try {
        user = jwt.verify(
          userDataCookie,
          import.meta.env.SECRET_KEY_CREATECOOKIE
        ) as UserData;
      } catch (error) {
        console.error("Error al decodificar cookie de usuario:", error);
        // Manejar error de decodificación
        return context.redirect("/login");
      }
    }

    // Rutas de administrador requieren rol específico
    // 🆕 NUEVA LÓGICA DE PERMISOS
    // Definimos qué permiso se necesita para cada ruta base
    // Importamos PERMISOS dinámicamente para usar las constantes
    const { PERMISOS } = await import("./modules/users/types/permissions");

    const permisosRequeridos: Record<string, string> = {
      "/dashboard/stock": PERMISOS.STOCK_VER,
      "/dashboard/ventas": PERMISOS.VENTAS_CREAR,
      "/dashboard/compras": PERMISOS.ORDEN_COMPRA_VER,
      "/dashboard/proveedores": PERMISOS.PROVEEDORES_VER,
      "/dashboard/clientes": PERMISOS.CLIENTES_VER,
      "/dashboard/configuracion": PERMISOS.EMPRESA_CONFIG,
    };

    // Buscamos si la ruta actual requiere algún permiso
    const path = context.url.pathname;
    const permisoRequerido = Object.entries(permisosRequeridos).find(
      ([route]) => path.startsWith(route)
    )?.[1];

    if (permisoRequerido) {
      // Importamos dinámicamente para evitar problemas de dependencias circulares
      const { tienePermiso } = await import(
        "./modules/users/utils/permissions"
      );

      // Adaptamos el objeto user para que coincida con la interfaz UsuarioConRol
      const usuarioConRol = {
        ...user,
        id: String(user?.id),
        rol: user?.rol || "vendedor",
        permisos: (user as any)?.permisos,
      };

      if (!tienePermiso(usuarioConRol, permisoRequerido as any)) {
        // Redirección inteligente basada en el rol si falla el permiso
        if (user?.rol === "vendedor")
          return context.redirect("/dashboard/ventas");
        if (user?.rol === "repositor")
          return context.redirect("/dashboard/stock");
        return context.redirect("/login"); // Fallback final
      }
    }

    // Establecer locales para acceso en páginas Astro
    context.locals.user = user;
    context.locals.session = session;

    return next();
  } catch (error) {
    console.error("Error en middleware:", error);
    // Sesión inválida
    return context.redirect("/login");
  }
});
