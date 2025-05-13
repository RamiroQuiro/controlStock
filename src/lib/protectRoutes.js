const PUBLIC_ROUTES = [
  '/',
  '/api/auth/signup',
  '/login',
  '/register',
  '/tienda',
  '/payment',
  '/api/auth/signout',
  '/api/auth/confirmacion/',
  '/api/auth/signin',
  '/api/course/data',
  '/passRestablecer/',
  /^\/verificar-email\/[a-zA-Z0-9-_]+$/,
  '/406',
];
const ADMIN_ROUTES = ['/dashboard/cursos/', '/dashboard/usuarios/'];

export { ADMIN_ROUTES, PUBLIC_ROUTES };
