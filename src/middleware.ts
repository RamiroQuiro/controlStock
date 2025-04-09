import { lucia } from '@/lib/auth';
import { defineMiddleware } from 'astro/middleware';
import { verifyRequestOrigin } from 'lucia';

// Rutas públicas
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signin',
  '/signup',
  '/api/auth/signin',
  '/api/auth/signup'
];

// Rutas de administrador
const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/dashboard/usuarios'
];

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

    // Rutas de administrador requieren rol específico
    if (ADMIN_ROUTES.includes(context.url.pathname) && user?.role !== 'admin') {
      return context.redirect('/dashboard');
    }

    // Adjuntar usuario a la solicitud para uso posterior
    context.locals.user = user;
    context.locals.session = session;

    return next();
  } catch {
    // Sesión inválida, redirigir a login
    return context.redirect('/signin');
  }
});
