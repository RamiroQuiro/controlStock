import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";


// Tabla de proveedores
export const proveedores = sqliteTable("proveedores", {
    id: text("id").primaryKey(),
    nombre: text("nombre").notNull(),
    contacto: text("contacto"),
    created_at: integer("created_at")
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  });