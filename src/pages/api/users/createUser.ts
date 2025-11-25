import type { APIContext } from "astro";
import { users } from "../../../db/schema";
import { and, eq, or } from "drizzle-orm";
import { generateId } from "lucia";
import bcrypt from "bcryptjs";
import db from "../../../db";
export async function POST({
  request,
  redirect,
  cookies,
}: APIContext): Promise<Response> {
  const formData = await request.json();

  const { email, password, dni, nombre, apellido, rol, creadoPor, depositoId } =
    await formData;

  if (!email || !password || !dni || !nombre || !apellido) {
    return new Response(
      JSON.stringify({
        data: "faltan campos requeridos",
        status: 400,
      })
    );
  }
  if (password.length < 6) {
    return new Response(
      JSON.stringify({
        data: "contraseña mayor a 6 caracteres",
        status: 400,
      })
    );
  }

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, creadoPor));

  if (adminUser?.rol !== "admin") {
    return new Response(
      JSON.stringify({
        data: "No tienes permisos para crear usuarios",
        status: 403,
      })
    );
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    return new Response(
      JSON.stringify({
        data: "email ya registrado",
        status: 400,
      })
    );
  }

  try {
    // Usamos transacción para asegurar que se cree el usuario Y se asigne el depósito
    await db.transaction(async (tx) => {
      const userId = generateId(10);
      const hashPassword = await bcrypt.hash(password, 12);

      // 1. Crear Usuario
      await tx.insert(users).values({
        id: userId,
        documento: String(dni),
        nombre: nombre,
        apellido: apellido,
        email: email,
        rol: rol || "vendedor", // Default a vendedor si no se especifica
        password: hashPassword,
        creadoPor: creadoPor,
        emailVerificado: true, // Auto-verificado al ser creado por admin
        empresaId: adminUser.empresaId, // Heredar empresa del admin
        userName: `${rol || "vendedor"}: ${nombre.toLowerCase()} ${apellido.toLowerCase()}`,
      });

      // 2. Asignar Depósito (si se envió)
      if (depositoId) {
        // Importamos dinámicamente para evitar problemas de dependencias circulares si las hubiera
        const { usuariosDepositos } = await import(
          "../../../db/schema/usuariosDepositos"
        );

        await tx.insert(usuariosDepositos).values({
          usuarioId: userId,
          depositoId: depositoId,
        });
      }
    });

    return new Response(
      JSON.stringify({
        data: "usuario creado con exito",
        status: 200,
      })
    );
  } catch (error) {
    console.error("Error creando usuario:", error);
    return new Response(
      JSON.stringify({
        data: "error al crear el usuario",
        status: 500,
      })
    );
  }
}
