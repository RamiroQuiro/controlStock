import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, empresas, usuariosDepositos, depositos } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { normalizadorUUID } from "../../utils/normalizadorUUID";

const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN!,
});

const db = drizzle(client);

async function fixUsersDeposits() {
  console.log("🔍 Iniciando reparación de relaciones Usuario-Depósito...");

  try {
    // 1. Obtener todos los usuarios
    const allUsers = await db.select().from(users);
    console.log(`👥 Total usuarios encontrados: ${allUsers.length}`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of allUsers) {
      // 2. Verificar si ya tiene depósito asignado
      const [relacion] = await db
        .select()
        .from(usuariosDepositos)
        .where(eq(usuariosDepositos.usuarioId, user.id));

      if (relacion) {
        skippedCount++;
        continue;
      }

      console.log(`⚠️ Usuario sin depósito: ${user.userName} (${user.email})`);

      // 3. Buscar un depósito de su empresa (preferiblemente "Casa Central" o el primero que encuentre)
      const depositosEmpresa = await db
        .select()
        .from(depositos)
        .where(eq(depositos.empresaId, user.empresaId));

      if (depositosEmpresa.length === 0) {
        console.error(
          `❌ Error: La empresa ${user.empresaId} no tiene depósitos.`
        );
        continue;
      }

      // Intentar encontrar "Casa Central", sino usar el primero
      const depositoAsignar =
        depositosEmpresa.find((d) => d.nombre === "Casa Central") ||
        depositosEmpresa[0];

      // 4. Crear la relación
      await db.insert(usuariosDepositos).values({
        usuarioId: user.id,
        depositoId: depositoAsignar.id,
      });

      console.log(
        `✅ Asignado a: ${depositoAsignar.nombre} (${depositoAsignar.id})`
      );
      fixedCount++;
    }

    console.log("\n📊 Resumen:");
    console.log(`✅ Usuarios arreglados: ${fixedCount}`);
    console.log(`⏭️ Usuarios ya correctos: ${skippedCount}`);
    console.log("✨ Proceso finalizado.");
  } catch (error) {
    console.error("❌ Error fatal:", error);
  }
}

fixUsersDeposits();
