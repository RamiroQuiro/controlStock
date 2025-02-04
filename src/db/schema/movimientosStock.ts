import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { productos } from "./productos";
import { users } from "./users";
import { proveedores } from "./proveedores";
import { clientes } from "./clientes";
import { sql } from "drizzle-orm";

// Tabla de movimientos de stock
export const movimientosStock = sqliteTable("movimientosStock", {
    id: text("id").primaryKey(),
    productoId: text("productoId").notNull().references(() => productos.id),
    cantidad: integer("cantidad").notNull(),
    tipo: text("tipo") // 'ingreso' o 'egreso'
      .notNull()
      .default("ingreso"),
    fecha: integer("fecha") // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    userId: text("userId").notNull().references(() => users.id),
    proveedorId: text("proveedorId").references(() => proveedores.id),
    clienteId: text("clienteId").references(() => clientes.id),
  });
