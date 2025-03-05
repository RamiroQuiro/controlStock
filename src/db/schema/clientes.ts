import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

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
    categoria: text("categoria").default("regular"),
    estado: text("estado").default("activo"),
    limiteCredito: integer("limiteCredito",{mode:'number'}).default(0),
    saldoPendiente: integer("saldoPendiente",{mode:'number'}).default(0),
    diasCredito: integer("diasCredito", {mode:'number'}).default(0),
    descuentoPreferencial: integer("descuentoPreferencial", {mode:'number'}).default(0),
});