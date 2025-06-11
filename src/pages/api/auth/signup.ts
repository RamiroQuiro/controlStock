import type { APIContext } from 'astro';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateId } from 'lucia';
import db from '../../../db';
import { getToken } from '../../../lib/confrmacionEmail';
import { sendMailer } from '../../../lib/nodemailer';
import { users } from '../../../db/schema';
import { getTemplate } from '../../../lib/templatesEmail/templates';

export async function POST({
  request,
  cookies,
}: APIContext): Promise<Response> {
  const formData = await request.json();
  const { email, password, razonSocial, nombre, apellido, rol } =
    await formData;
  // console.log(email, password);
  if (!email || !password || !razonSocial || !nombre || !apellido) {
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
    .where(or(eq(users.email, email), eq(users.razonSocial, razonSocial)));

  if (existingUser.length > 0) {
    return new Response(
      JSON.stringify({
        msg: 'email o razonSocial ya registrado',
        status: 400,
      })
    );
  }

  // crear usuario en DB

  const userId = generateId(15);
  // Hacemos hash de la contraseña
  const hashPassword = await bcrypt.hash(password, 12);
  console.log(userId, email, password, razonSocial, nombre, apellido, rol);
  const newUser = (
    await db
      .insert(users)
      .values({
        id: userId,
        razonSocial,
        nombre,
        apellido,
        srcPhoto: '/avatarDefault.png',
        email,
        rol: rol || 'admin',
        password: hashPassword,
        creadoPor: userId,
      })
      .returning()
  ).at(0);

  // generando el token de confirmacion de email

  const code = generateId(6);
  const tokenConfirmacionEmail = getToken({
    email,
    code,
  });
  const template = getTemplate(`${nombre} ${apellido}`, tokenConfirmacionEmail);

  await sendMailer(email, 'Confirmacion de Cuenta controlStock', template);

  return new Response(
    JSON.stringify({
      msg: 'Email de confirmacion enviado, revise su correo',
      status: 200,
    })
  );
}
