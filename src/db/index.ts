import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

if (!import.meta.env.TURSO_DB_URL || !import.meta.env.TURSO_DB_AUTH_TOKEN) {
  throw new Error("Missing Turso database credentials");
}

const client = createClient({
  // URL local donde se guardará la copia súper rápida (se crea sola)
  url: "file:replica.db", 
  // La URL real de Turso a la que nos sincronizamos
  syncUrl: import.meta.env.TURSO_DB_URL, 
  authToken: import.meta.env.TURSO_DB_AUTH_TOKEN,
  // Sincroniza cambios traídos por otros usuarios cada 60 segundos
  syncInterval: 60, 
});

import * as schema from "./schema";

const db = drizzle(client, { schema });

export default db;
