import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, empresas } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { normalizadorUUID } from "../../utils/normalizadorUUID";

const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN!,
});

const db = drizzle(client);

async function fixUserCompany() {
  console.log("🔍 Verificando asociación Usuario-Empresa...");

  // 1. Obtener todos los usuarios
  const allUsers = await db.select().from(users);

  if (allUsers.length === 0) {
    console.log("❌ No hay usuarios en la base de datos.");
    return;
  }

  for (const user of allUsers) {
    console.log(
      `\n👤 Usuario: ${user.email} (${user.nombre} ${user.apellido})`
    );

    if (!user.empresaId) {
      console.log("   ⚠️ No tiene empresa asignada.");
      await asignarEmpresa(user);
    } else {
      // Verificar si la empresa existe
      const empresa = await db
        .select()
        .from(empresas)
        .where(eq(empresas.id, user.empresaId))
        .limit(1);

      if (!empresa) {
        console.log(
          `   ❌ Tiene empresaId (${user.empresaId}) pero la empresa NO existe.`
        );
        await asignarEmpresa(user);
      } else {
        console.log(
          `   ✅ Empresa asignada: ${empresa.razonSocial} (${empresa.id})`
        );
      }
    }
  }
}

async function asignarEmpresa(user: any) {
  // Buscar si existe alguna empresa
  const empresaExistente = (await db.select().from(empresas)).at(0);

  if (empresaExistente) {
    console.log(
      `   🔄 Asignando a empresa existente: ${empresaExistente.razonSocial}`
    );
    await db
      .update(users)
      .set({ empresaId: empresaExistente.id })
      .where(eq(users.id, user.id));
    console.log("   ✅ Usuario actualizado.");
  } else {
    console.log("   🆕 Creando nueva empresa por defecto...");
    const newEmpresaId = normalizadorUUID("empresa", 14);
    await db.insert(empresas).values({
      id: newEmpresaId,
      razonSocial: "RamaCode",
      userId: user.id,
      documento: "00000000000",
      emailEmpresa: user.email,
    });

    await db
      .update(users)
      .set({ empresaId: newEmpresaId })
      .where(eq(users.id, user.id));
    console.log("   ✅ Empresa creada y usuario actualizado.");
  }
}

fixUserCompany()
  .then(() => {
    console.log("\n✨ Proceso finalizado.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
