import { createClient } from "@libsql/client";
import 'dotenv/config';

async function destroyFTS() {
  console.log("🧹 Eliminando tabla virtual FTS permanente...");
  try {
    const db = createClient({
      url: process.env.TURSO_DB_URL!,
      authToken: process.env.TURSO_DB_AUTH_TOKEN!,
    });
    
    await db.execute("DROP TABLE IF EXISTS productos_fts;");
    console.log("✅ Tabla productos_fts borrada de la base de datos de Turso.");
  } catch (error) {
    console.error("❌ Error al borrar FTS:", error);
  }
}

destroyFTS();
