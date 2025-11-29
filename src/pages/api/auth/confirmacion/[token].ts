import type { APIRoute } from "astro";
import { getTokenData } from "../../../../lib/confrmacionEmail";
import db from "../../../../db";
import { users } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { lucia } from "../../../../lib/auth";
import jwt from "jsonwebtoken";
import { inicializarEmpresaParaUsuario } from "../../../../services/creacionInicialEmpresa.service";

type userData = {
  id: string;
  nombre: string;
  apellido: string;
  userName: string;
  email: string;
  clienteDefault: string;
  proveedorDefault: string;
  rol: string;
  puntosDeVenta: string;
  empresaId: string;
};

export const GET: APIRoute = async ({ request, params, redirect, cookies }) => {
  const { token: confirmationToken } = params;

  if (!confirmationToken) {
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "Token no proporcionado",
      })
    );
  }

  try {
    const { data } = getTokenData(confirmationToken);
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

    const {
      clienteDefault,
      proveedorDefault,
      puntoVenta,
      empresaId,
      depositoDefault,
    } = await inicializarEmpresaParaUsuario(userFind);
    console.log(
      "datos de la inicilaziaacion",
      clienteDefault,
      proveedorDefault,
      puntoVenta,
      empresaId,
      depositoDefault
    );

    await db
      .update(users)
      .set({
        emailVerificado: true,
        empresaId: empresaId,
      })
      .where(eq(users.id, userFind.id));

    const session = await lucia.createSession(userFind.id, {
      userName: userFind.userName,
    });

    // console.log('sesion de usuario de alta ', session);
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Crear una cookie con los datos del usuario
    const userData: userData = {
      id: userFind.id,
      nombre: userFind.nombre,
      apellido: userFind.apellido,
      depositoDefault: depositoDefault,
      userName: userFind.userName,
      email: userFind.email,
      clienteDefault: clienteDefault,
      proveedorDefault: proveedorDefault,
      puntosDeVenta: puntoVenta,
      rol: userFind.rol,
      empresaId: empresaId,
      rolPersonalizadoId: userFind.rolPersonalizadoId || null,
    };

    const jwtToken = jwt.sign(
      userData,
      import.meta.env.SECRET_KEY_CREATECOOKIE,
      {
        expiresIn: "14d",
      }
    );
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
        msg: "Email verificado correctamente",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la confirmación:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error al verificar el email",
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500 }
    );
  }
};
