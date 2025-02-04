import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";




// Tabla de usuarios
export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    nombre: text("nombre").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    rol: text("rol")
      .notNull()
      .default("empleado"), // Opciones: 'admin', 'empleado'
  });