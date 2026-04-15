import type { APIContext } from "astro";
import { users } from "../../../db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { generateId } from "lucia";
import bcrypt from "bcryptjs";
import db from "../../../db";
export async function POST({
  request,
  redirect,
  cookies,
}: APIContext): Promise<Response> {
  const formData = await request.json();

  const {
    email,
    password,
    dni,
    nombre,
    apellido,
    rol,
    creadoPor,
    depositoId,
    rolPersonalizadoId,
  } = await formData;

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

  // --- VALIDACIÓN DE LÍMITES POR PLAN ---
  const { empresas, planes } = await import("../../../db/schema");
  
  const [empresaData] = await db
    .select({
      id: empresas.id,
      planId: empresas.planId,
      cantidadUsuarios: empresas.cantidadUsuarios,
      nombreFantasia: empresas.nombreFantasia,
    })
    .from(empresas)
    .where(eq(empresas.id, adminUser.empresaId));

  if (empresaData?.planId) {
    const [planData] = await db
      .select({
        limiteUsuarios: planes.limiteUsuarios,
        nombre: planes.nombre,
      })
      .from(planes)
      .where(eq(planes.id, empresaData.planId));

    if (planData && empresaData.cantidadUsuarios >= planData.limiteUsuarios) {
      return new Response(
        JSON.stringify({
          data: `Límite de usuarios alcanzado (${planData.limiteUsuarios}) para tu ${planData.nombre}. Por favor, actualiza tu plan para agregar más usuarios.`,
          status: 403,
        })
      );
    }
  }
  // ---------------------------------------

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
        rolPersonalizadoId: rolPersonalizadoId || null, // Guardar rol personalizado si existe
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

      // 3. Actualizar contador en Empresa
      await tx
        .update(empresas)
        .set({
          cantidadUsuarios: sql`${empresas.cantidadUsuarios} + 1`,
        })
        .where(eq(empresas.id, adminUser.empresaId));
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
