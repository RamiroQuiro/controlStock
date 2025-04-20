import type { APIContext } from "astro";
import { users } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import bcrypt from 'bcryptjs'
import db from "../../../db";
export async function POST({ request, redirect, cookies }: APIContext): Promise<Response> {
    const formData = await request.json();
    
    const { email, password, dni, nombre, apellido,rol,creadoPor } = await formData;
    // console.log(email, password);
    if (!email || !password || !dni || !nombre || !apellido) {
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
//   hacer la comprobacion si el eusuario puede o no crar mas usuarios

const adminUser = await db.select().from(users).where(eq(users.id, creadoPor));
if (adminUser[0]?.rol !== 'admin') {
  return new Response(
    JSON.stringify({
      data: 'No tienes permisos para crear usuarios',
      status: 403,
    })
  );
}
    //   verificar si el usuario existe
    const existingUser = await db.select().from(users).where(and(eq(users.email, email), eq(users.documento, dni),eq(users.creadoPor, creadoPor)));
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
  
    const userId = generateId(10);
    // Hacemos hash de la contraseña
    const hashPassword = await bcrypt.hash(password, 12);
  
    const newUser = (
      await db
        .insert(users)
        .values([
          {
            id: userId,
            dni: dni,
            nombre:nombre,
            apellido: apellido,
            email: email,
            rol: rol ||'admin',
            password: hashPassword,
            creadoPor: creadoPor,
            userName:`${rol || 'admin'}: ${nombre.toLowerCase()} ${apellido.toLowerCase()}`
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
   
      return new Response(
      JSON.stringify({
        data: 'usuario creado con exito',
        status: 200,
      })
    );
  }
  