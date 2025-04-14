import type { APIContext } from 'astro';

import jwt from 'jsonwebtoken';

import path from "path";
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateId } from 'lucia';
import db from '../../../db';
import { users } from '../../../db/schema';
import { lucia } from '../../../lib/auth';
import { promises as fs } from "fs";

export async function POST({ request, redirect, cookies }: APIContext): Promise<Response> {
  const formData = await request.json();
  console.log(formData);
  const { email, password, userName, nombre, apellido } = await formData;
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
  const existingUser = await db.select().from(users).where(and(eq(users.email, email), eq(users.userName, userName)));
  // console.log(existingUser);

  if (existingUser.length > 0) {
    return new Response(
      JSON.stringify({
        data: 'email ya registrado',
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
          nombre: userName,
          apellido: userName,
          email: email,
          password: hashPassword,
        },
      ])
      .returning()
  ).at(0);
  // console.log('NUEV USUARIO->', newUser);
  if (!newUser) {
    return new Response(
      JSON.stringify({
        data: 'error al crear el usuario',
        status: 500,
      })
    );
  }
  const session = await lucia.createSession(userId, {
    userName: userName,
  });

  // crear directorio para iamgenes
      const userDir = path.join(process.cwd(), "element", "imgs", userId, "productos");
      await fs.mkdir(userDir, { recursive: true });
      
  // console.log('sesion de usuario de alta ', session);
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  // Crear una cookie con los datos del usuario
  const userData = {
    id: newUser.id,
    userName: newUser.userName,
    email: newUser.email,
    apellido: newUser.apellido,
    nombre: newUser.nombre,
  };

  const token = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, { expiresIn: '14d' }); // Firmar la cookie
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
