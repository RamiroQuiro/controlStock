import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, unique } from "drizzle-orm/sqlite-core";
import { proveedores } from "./proveedores";
import { clientes } from "./clientes";
import { users } from "./users";
import { productos } from "./productos";

// Tabla principal de presupuestos
export const presupuesto = sqliteTable('presupuesto', {
  id: text('id').primaryKey(),
  codigo: text('codigo'),
  userId: text("userId").references(() => users.id),
  fecha: integer("fecha")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  clienteId: text("clienteId").references(() => clientes.id),
  total: integer("total", { mode: "number" }).notNull(),
  impuesto: integer("impuesto", { mode: "number" }).notNull().default(0),
  descuento: integer("descuento", { mode: "number" }).notNull().default(0),
  estado: text("estado", { enum: ['activo', 'convertido', 'expirado'] }).notNull().default('activo'),
  expira_at: integer("expira_at").notNull(), // Timestamp de expiración
});

