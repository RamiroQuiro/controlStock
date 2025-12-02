import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import db from "../../../db";
import { getToken } from "../../../lib/confrmacionEmail";
import { sendMailer } from "../../../lib/nodemailer";
import { users } from "../../../db/schema";
import { getTemplate } from "../../../lib/templatesEmail/templates";

export async function POST({ request, url }: APIContext): Promise<Response> {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ msg: "Email requerido" }), {
        status: 400,
      });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      // Por seguridad, no decimos si el email existe o no, pero simulamos éxito
      return new Response(
        JSON.stringify({
          msg: "Si el email existe, se ha enviado un correo de verificación.",
        }),
        { status: 200 }
      );
    }

    if (user.emailVerificado) {
      return new Response(
        JSON.stringify({ msg: "Este email ya está verificado." }),
        { status: 400 }
      );
    }

    // Generar nuevo token y enviar email
    const code = generateId(6);
    const hostUrl = url.origin;

    const tokenConfirmacionEmail = getToken({
      email: user.email,
      code,
      hostUrl,
    });

    const template = getTemplate(
      `${user.nombre} ${user.apellido}`,
      tokenConfirmacionEmail,
      hostUrl
    );

    await sendMailer(
      user.email,
      "Reenviar Confirmación de Cuenta controlStock",
      template
    );

    return new Response(
      JSON.stringify({
        msg: "Correo de verificación reenviado exitosamente.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al reenviar verificación:", error);
    return new Response(JSON.stringify({ msg: "Error interno del servidor" }), {
      status: 500,
    });
  }
}
