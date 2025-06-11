import type { APIContext } from 'astro';
import { lucia } from '../../../lib/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../db';
import { clientes, proveedores, users } from '../../../db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST({
  request,
  cookies,
}: APIContext): Promise<Response> {
  const formData = await request.json();

  const { email, password } = await formData;
  if (!email || !password) {
    return new Response(
      JSON.stringify({ msg: 'email y contraseña requerida', status: 400 })
    );
  }

  //   verificar si el usuario existe

  const [findUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  const [findClienteDefault] = await db
    .select()
    .from(clientes)
    .where(
      and(
        eq(clientes.empresaId, findUser.empresaId),
        eq(clientes.nombre, 'consumidor final')
      )
    );
  const [findProovedorDefault] = await db
    .select()
    .from(proveedores)
    .where(
      and(
        eq(proveedores.empresaId, findUser.empresaId),
        eq(proveedores.nombre, 'proveedor general')
      )
    );

  if (!findUser || findUser.activo === 0) {
    return new Response(
      JSON.stringify({ msg: 'email incorrecta', status: 401 })
    );
  }
  if (!findUser.emailVerificado) {
    console.log('Usuario no tiene email verificado');
    return new Response(
      JSON.stringify({ msg: 'email no verificado', status: 401 })
    );
  }

  // crear usuario en DB
  // Hacemos comapracion  hash de la contraseña
  if (!(await bcrypt.compare(password, findUser.password))) {
    return new Response(
      JSON.stringify({
        msg: 'contraseña incorrecta',
        status: 402,
      })
    );
  }
  const session = await lucia.createSession(findUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  // Crear una cookie con los datos del usuario
  const userData = {
    id: findUser.id,
    nombre: findUser.nombre,
    apellido: findUser.apellido,
    userName: findUser.userName,
    srcPhoto: findUser.srcPhoto,
    email: findUser.email,
    rol: findUser.rol,
    clienteDefault: findClienteDefault.id,
    proveedorDefault: findProovedorDefault.id,
    creadoPor: findUser.creadoPor,
    empresaId: findUser.empresaId,
  };

  const token = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, {
    expiresIn: '14d',
  }); // Firmar la cookie
  cookies.set('userData', token, {
    httpOnly: true,
    secure: import.meta.env.NODE_ENV === 'production', // Solo enviar en HTTPS en producción
    sameSite: 'strict',
    maxAge: 14 * 24 * 3600, // 14 días
    path: '/',
  });
  return new Response(
    JSON.stringify({
      msg: 'usuario logeado con exito',
      status: 200,
    })
  );
}
