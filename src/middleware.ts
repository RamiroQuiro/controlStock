import { lucia } from '@/lib/auth';
import { defineMiddleware } from 'astro/middleware';
import { verifyRequestOrigin } from 'lucia';
import { ADMIN_ROUTES, PUBLIC_ROUTES } from './lib/protectRoutes';

export const onRequest = defineMiddleware(async (context, next) => {
  // Verificar origen de la solicitud para prevenir CSRF
  if (context.request.method !== 'GET') {
    const originHeader = context.request.headers.get('Origin') ?? null;
    const hostHeader = context.request.headers.get('Host') ?? null;
    
    if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
      return new Response(null, {
        status: 403,
        statusText: 'Forbidden'
      });
    }
  }

  // Verificar sesión para rutas protegidas
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
  
  // Rutas públicas siempre accesibles
  if (PUBLIC_ROUTES.includes(context.url.pathname)) {
    return next();
  }

  // Verificar sesión para rutas que requieren autenticación
  if (!sessionId) {
    return context.redirect('/login');
  }

  try {
    const { session, user } = await lucia.validateSession(sessionId);
    
    // Renovar sesión si es necesario
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookies.set(
        sessionCookie.name, 
        sessionCookie.value, 
        sessionCookie.attributes
      );
    }

    // Agregar cookie con información del usuario para el navbar
    if (user) {
      context.cookies.set('user_info', JSON.stringify({
        userName: user.userName,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email
      }), {
        path: '/',
        httpOnly: false, // Necesario para acceder desde el cliente
        maxAge: 60 * 60 * 24 * 7 // 1 semana
      });

      // Rutas de administrador requieren rol específico
      if (ADMIN_ROUTES.includes(context.url.pathname) && user?.role !== 'admin') {
        return context.redirect('/dashboard');
      }

      // Establecer locales para acceso en páginas Astro
      context.locals.user = user;
      context.locals.session = session;
    }

    return next();
  } catch {
    // Sesión inválida
    return context.redirect('/login');
  }
});
