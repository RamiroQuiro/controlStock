import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { productos, users, empresas } from "../schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN!,
});

const db = drizzle(client);

// ID del usuario principal (tu usuario)
const TARGET_EMAIL = "rama.exe.13@gmail.com";

async function fixProductsCompany() {
  console.log("🔍 Migrando productos a la empresa correcta...");

  // 1. Obtener el usuario objetivo para saber su empresa
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, TARGET_EMAIL));

  if (!user || !user.empresaId) {
    console.error("❌ Usuario no encontrado o sin empresa asignada.");
    return;
  }

  console.log(`👤 Usuario: ${user.email}`);
  console.log(`🏢 Empresa ID: ${user.empresaId}`);

  // 2. Actualizar TODOS los productos para que pertenezcan a esta empresa
  // (Útil en desarrollo si sos el único usuario)
  const result = await db
    .update(productos)
    .set({ empresaId: user.empresaId })
    .returning({ id: productos.id });

  console.log(
    `✅ Se actualizaron ${result.length} productos a la empresa ${user.empresaId}`
  );
}

fixProductsCompany()
  .then(() => {
    console.log("\n✨ Proceso finalizado.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
