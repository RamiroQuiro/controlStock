import type { APIContext } from 'astro';

import jwt from 'jsonwebtoken';

import path from 'path';
import { and, eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateId } from 'lucia';
import db from '../../../db';
import { clientes, proveedores, users } from '../../../db/schema';
import { lucia } from '../../../lib/auth';
import { promises as fs } from 'fs';
import { inicializarRoles } from '../../../services/roles.sevices';

export async function POST({
  request,
  redirect,
  cookies,
}: APIContext): Promise<Response> {
  const formData = await request.json();
  const { email, password, userName, nombre, apellido, rol } = await formData;
  // console.log(email, password);
  if (!email || !password || !userName || !nombre || !apellido) {
    return new Response(
      JSON.stringify({
        data: 'faltan campos requeridos',
        status: 400,
      })
    );
  }
  if (password.length < 6) {
    return new Response(
      JSON.stringify({
        data: 'contraseña mayor a 6 caracteres',
        status: 400,
      })
    );
  }

  //   verificar si el usuario existe
  const existingUser = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.userName, userName)));

  if (existingUser.length > 0) {
    return new Response(
      JSON.stringify({
        msg: 'email o userName ya registrado',
        status: 400,
      })
    );
  }

  // crear usuario en DB

  const userId = generateId(15);
  // Hacemos hash de la contraseña
  const hashPassword = await bcrypt.hash(password, 12);

  const newUser = (
    await db
      .insert(users)
      .values([
        {
          id: userId,
          userName: userName,
          nombre: nombre,
          apellido: apellido,
          srcPhoto: './avatarDefault.png',
          email: email,
          rol: rol || 'admin',
          password: hashPassword,
          creadoPor: userId,
        },
      ])
      .returning()
  ).at(0);

  // Crear Proveedor Comodín

  const [proveedorComodin] = await db
    .insert(proveedores)
    .values({
      id: generateId(13),
      nombre: 'Proveedor General',
      userId: userId,
      esComodin: true, // Añade esta bandera
      telefono: 'N/A', // Campos obligatorios
      email: 'proveedor.general@tuempresa.com',
      direccion: 'N/A',
      created_at: new Date().toISOString(), // Usa formato ISO
    })
    .returning();

  // Crear Cliente Final
  const [clienteFinal] = await db
    .insert(clientes)
    .values({
      id: generateId(13),
      nombre: 'Cliente Final',
      userId: userId,
      esClienteFinal: true, // Añade esta bandera
      telefono: 'N/A', // Campos obligatorios
      email: 'cliente.final@tuempresa.com',
      direccion: 'N/A',
      fechaAlta: new Date().toISOString(), // Usa formato ISO
    })
    .returning();

  if (!newUser) {
    return new Response(
      JSON.stringify({
        data: 'error al crear el usuario',
        status: 500,
      })
    );
  }

  // Si el usuario es admin, inicializar roles
  if (newUser && newUser.rol === 'admin') {
    try {
      await inicializarRoles(userId);
    } catch (rolesError) {
      console.error('Error al inicializar roles:', rolesError);
      // Opcional: manejar el error sin interrumpir el registro
    }
  }
  const session = await lucia.createSession(userId, {
    userName: userName,
  });

  // crear directorio para iamgenes
  const userDir = path.join(
    process.cwd(),
    'element',
    'imgs',
    userId,
    'productos'
  );
  await fs.mkdir(userDir, { recursive: true });

  // console.log('sesion de usuario de alta ', session);
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  // Crear una cookie con los datos del usuario
  const userData = {
    id: newUser.id,
    nombre: newUser.nombre,
    apellido: newUser.apellido,
    userName: newUser.userName,
    email: newUser.email,
    rol: newUser.rol,
    creadoPor: newUser.creadoPor,
  };

  const token = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, {
    expiresIn: '14d',
  }); // Firmar la cookie
  cookies.set('userData', token, {
    httpOnly: true,
    secure: import.meta.env.NODE_ENV === 'production', // Solo enviar en HTTPS en producción
    sameSite: 'strict',
    maxAge: 14 * 24 * 3600, // 14 días en segundos
    path: '/',
  });

  return new Response(
    JSON.stringify({
      data: 'usuario creado con exito',
      status: 200,
    })
  );
}
