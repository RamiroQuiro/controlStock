import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";


// Tabla de clientes
export const clientes = sqliteTable("clientes", {
    id: text("id").primaryKey(),
    userId: text('userId').references(() => users.id),
    nombre: text("nombre").notNull(),
    telefono: text("telefono"),
    dni: integer('dni', { mode: 'number' }),
    email: text("email"),
    direccion: text("direccion"),
    observaciones: text("observaciones"),
    fechaAlta: integer("fechaAlta").default(sql`(strftime('%s', 'now'))`),
    ultimaCompra: text("ultimaCompra"),
    categoria: text("categoria").default("regular"), // VIP, Regular, Nuevo
    estado: text("estado").default("activo"), // Activo, Inactivo
    limiteCredito: integer("limiteCredito",{mode:'number'}).default(0),
    saldoPendiente: integer("saldoPendiente",{mode:'number'}).default(0),
});