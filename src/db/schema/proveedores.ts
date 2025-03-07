import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// Tabla de proveedores
export const proveedores = sqliteTable("proveedores", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  contacto: text("contacto"),
  dni: integer('dni', { mode: 'number' }),
  celular: text('celular'),
  email: text('email'),
  direccion: text('direccion'), 
  estado: text('estado', { enum: ['activo', 'inactivo']}).default('activo'), 
  observaciones: text('observaciones'), 
  userId: text('userId').references(() => users.id),
  created_at: integer("created_at")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});