import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";


export const ventas = sqliteTable("ventas", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => users.id),
  fecha: integer("fecha") // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  clienteId: text("clienteId").notNull().default("00"),
  metodoPago:text('metodoPago').default('efectivo'),
  nComprobante:text('nComprobante'),
  srcComprobante:text('srcComprobante'),
  nCheque:text('nCheque'),
  vencimientoCheque:text('vencimientoCheque'),
  total: integer("total", { mode: "number" }).notNull(),
  impuesto: integer("impuesto", { mode: "number" }).notNull().default(0), // Almacena el total del IVA aplicado
  descuento: integer("descuento", { mode: "number" }).notNull().default(0), // Almacena el descuento total aplicado
});
