import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// src/db/schema/roles.ts
export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull().unique(),
  descripcion: text("descripcion"),
  permisos: text("permisos", { mode: 'json' }).$type<string[]>(), // Permisos como array JSON
  creadoPor: text("creadoPor").references(() => users.id),
  fechaCreacion: integer("created_at") // Timestamp Unix
  .notNull()
  .default(sql`(strftime('%s', 'now'))`),

},
(t) => [
  // Índice único compuesto para evitar duplicados de dni por usuario
  unique().on(t.id, t.nombre,t.creadoPor),
]);

