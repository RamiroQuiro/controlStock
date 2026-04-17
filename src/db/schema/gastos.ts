import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  real,
} from "drizzle-orm/sqlite-core";
import { empresas } from "./empresas";
import { users } from "./users";

export const gastos = sqliteTable("gastos", {
  id: text("id").primaryKey(),
  empresaId: text("empresaId")
    .notNull()
    .references(() => empresas.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  categoria: text("categoria").notNull(), // Ej: Luz, Gas, Sueldos, Alquiler, Materia Prima
  monto: real("monto").notNull(),
  descripcion: text("descripcion"),
  metodoPago: text("metodoPago").default("efectivo"),
  comprobanteUrl: text("comprobanteUrl"), // Para almacenar referencia a foto del ticket
  fecha: integer("fecha", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
