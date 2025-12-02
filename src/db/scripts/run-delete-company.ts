import "dotenv/config";
import { deleteCompanyCascade } from "./delete-company-cascade";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const empresaId = process.argv[2];

if (!empresaId) {
  console.error("❌ Por favor proporciona el ID de la empresa a eliminar.");
  console.error(
    "Uso: npx tsx src/db/scripts/run-delete-company.ts <ID_EMPRESA>"
  );
  process.exit(1);
}

// Crear conexión directa para el script
if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_AUTH_TOKEN) {
  throw new Error("Faltan credenciales de Turso en .env");
}

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
});

const db = drizzle(client);

console.log(
  `⚠️  ATENCIÓN: Estás a punto de eliminar la empresa ${empresaId} y TODOS sus datos.`
);
console.log("⏳ Iniciando en 3 segundos... (Ctrl+C para cancelar)");

setTimeout(async () => {
  try {
    const result = await deleteCompanyCascade(empresaId, db);
    if (result.success) {
      console.log("✅ Proceso finalizado correctamente.");
    } else {
      console.error("❌ Hubo un error:", result.msg);
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    process.exit(1);
  }
}, 3000);
