import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const comprobantes = sqliteTable("comprobantes", {
  id: text("id").primaryKey(),
  empresaId: text("empresaId").notNull(),
  ventaId: text("ventaId"), // si corresponde a una venta
  tipo: text("tipo",{enum: ["FC_A", "FC_B", "FC_C", "PR", "NC", "RECIBO", "PRESUPUESTO"]})
    .notNull()
    .default("FC_B"),
  puntoVenta: text("puntoVenta").notNull(),
  // Cambiamos el manejo de fechas para SQLite
  fechaEmision: integer("fechaEmision", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  numero: integer("numero", { mode: "number" }).notNull(),
  numeroFormateado: text("numeroFormateado").notNull(), // ej: FC-A-0001-00000125
  // Cambiamos el formato de fecha para SQLite
  fecha: integer("fecha", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  clienteId: text("clienteId"), // opcional
  total: integer("total"), // monto total si lo querés guardar
  estado: text("estado").notNull().default("emitido"), // 'emitido', 'anulado', etc.
  cae: text("cae"), // Código de autorización electrónica (si aplica)
  caeVencimiento: integer("caeVencimiento", { mode: "timestamp" }),
  observaciones: text("observaciones"),
  create_at: integer("create_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  update_at: integer("update_at", { mode: "timestamp" }),
});

