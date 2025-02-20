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
    total: integer("total", { mode: "number" }).notNull(),
  });