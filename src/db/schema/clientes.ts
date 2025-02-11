import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";


// Tabla de clientes
export const clientes = sqliteTable("clientes", {
    id: text("id").primaryKey(),
    userId:text('userId').references(()=>users.id),
    nombre: text("nombre").notNull(),
    telefono: text("telefono"),
    dni:integer('dni',{mode:'number'}),
    email: text("email"),
    direccion: text("direccion"),
    observaciones: text("observaciones"),
  });