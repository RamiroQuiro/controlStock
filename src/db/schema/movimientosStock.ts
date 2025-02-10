import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { productos } from "./productos";
import { users } from "./users";
import { proveedores } from "./proveedores";
import { clientes } from "./clientes";


export const movimientosStock = sqliteTable("movimientosStock", {
  id: text("id").primaryKey(),
  productoId: text("productoId").notNull().references(() => productos.id),
  cantidad: integer("cantidad").notNull(),
  tipo: text("tipo") // 'recarga', 'devolucion', 'vencimiento', 'movimiento'
    .notNull()
    .default("recarga"),
  fecha: integer("fecha") // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  userId: text("userId").notNull().references(() => users.id),
  proveedorId: text("proveedorId").references(() => proveedores.id),
  motivo: text("motivo"), // Breve razón del movimiento
  observacion: text("observacion"), // Detalles adicionales opcionales
  clienteId: text("clienteId").references(() => clientes.id),
});
