import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";


// Tabla de clientes
export const clientes = sqliteTable("clientes", {
    id: text("id").primaryKey(),
    nombre: text("nombre").notNull(),
    telefono: text("telefono"),
    email: text("email"),
    direccion: text("direccion"),
  });