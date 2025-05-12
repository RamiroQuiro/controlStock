import { lucia } from '../src/lib/auth';
import { defineMiddleware } from 'astro/middleware';
import { verifyRequestOrigin } from 'lucia';
import { ADMIN_ROUTES, PUBLIC_ROUTES } from './lib/protectRoutes';
import jwt from 'jsonwebtoken';
import { puedeAccederRuta } from './utils/permisosRoles';
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
  if (context.url.pathname.startsWith('/api/auth/')) {
    return next();
  }

  // Verificar origen de la solicitud para prevenir CSRF
  if (context.request.method !== 'GET') {
    const originHeader = context.request.headers.get('Origin') ?? null;
    const hostHeader = context.request.headers.get('Host') ?? null;

    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new Response(null, {
        status: 403,
        statusText: 'Forbidden',
      });
    }
  }

  // Verificar sesión para rutas protegidas
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
  const userDataCookie = context.cookies.get('userData')?.value ?? null;
  // Rutas públicas siempre accesibles
  if (PUBLIC_ROUTES.includes(context.url.pathname)) {
    return next();
  }

  // Verificar sesión para rutas que requieren autenticación
  if (!sessionId) {
    return context.redirect('/login');
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
        console.error('Error al decodificar cookie de usuario:', error);
        // Manejar error de decodificación
        return context.redirect('/login');
      }
    }

    // Rutas de administrador requieren rol específico
    if (!puedeAccederRuta(user, context.url.pathname)) {
      if (user?.rol === 'vendedor') {
        return context.redirect('/dashboard/ventas');
      }
      if (user?.rol === 'repositor') {
        return context.redirect('/dashboard/stock');
      }
      return context.redirect('/login');
    }

    // Establecer locales para acceso en páginas Astro
    context.locals.user = user;
    context.locals.session = session;

    return next();
  } catch {
    // Sesión inválida
    return context.redirect('/login');
  }
});
