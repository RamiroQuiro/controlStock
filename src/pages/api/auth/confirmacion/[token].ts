import type { APIRoute } from "astro";
import { getTokenData } from "../../../../lib/confrmacionEmail";
import db from "../../../../db";
import { clientes, proveedores, users } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { inicializarRoles } from "../../../../services/roles.sevices";
import { lucia } from "../../../../lib/auth";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';

export const GET: APIRoute = async ({ request, params, redirect, cookies }) => {
  const { token: confirmationToken } = params;
  
  if (!confirmationToken) {
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "Token no proporcionado"
      })
    );
  }

  try {
    const { data } = getTokenData(confirmationToken);
    console.log("esta es la verificacoin", data);
    if (!data) {
      return new Response(
        JSON.stringify({
          msg: 400,
          message: "error al obtener la data",
        })
      );
    }

    const [userFind] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (!userFind) {
      return new Response(
        JSON.stringify({
          sucess: false,
          status: 200,
          msg: "no se encontro usuario",
        })
      );
    }

    await db.update(users).set({
     emailVerificado: true,
    });

    // Crear Proveedor Comodín

    const [proveedorComodin] = await db
      .insert(proveedores)
      .values({
        id: generateId(13),
        nombre: "Proveedor General",
        userId: userFind.id,
        esComodin: true, // Añade esta bandera
        telefono: "N/A", // Campos obligatorios
        email: "proveedor.general@tuempresa.com",
        direccion: "N/A",
        created_at: new Date().toISOString(), // Usa formato ISO
      })
      .returning();

    // Crear Cliente Final
    const [clienteFinal] = await db
      .insert(clientes)
      .values({
        id: generateId(13),
        nombre: "Cliente Final",
        userId: userFind.id,
        esClienteFinal: true, // Añade esta bandera
        telefono: "N/A", // Campos obligatorios
        email: "cliente.final@tuempresa.com",
        direccion: "N/A",
        fechaAlta: new Date().toISOString(), // Usa formato ISO
      })
      .returning();


    // Si el usuario es admin, inicializar roles
    if (userFind && userFind.rol === "admin") {
      try {
        await inicializarRoles(userFind.id);
      } catch (rolesError) {
        console.error("Error al inicializar roles:", rolesError);
        // Opcional: manejar el error sin interrumpir el registro
      }
    }
    const session = await lucia.createSession(userFind.id, {
      userName: userFind.userName,
    });

    // crear directorio para iamgenes
    const userDir = path.join(
      process.cwd(),
      "element",
      "imgs",
      userFind.id,
      "productos"
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
      id: userFind.id,
      nombre: userFind.nombre,
      apellido: userFind.apellido,
      userName: userFind.userName,
      email: userFind.email,
      rol: userFind.rol,
      creadoPor: userFind.creadoPor,
    };

    const jwtToken = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, {
      expiresIn: "14d",
    });
    cookies.set("userData", jwtToken, {
      httpOnly: true,
      secure: import.meta.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 14 * 24 * 3600,
      path: "/",
    });

    // En lugar de redirigir, devolvemos una respuesta JSON
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Email verificado correctamente"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la confirmación:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error al verificar el email",
        error: error instanceof Error ? error.message : "Error desconocido"
      }),
      { status: 500 }
    );
  }
};
