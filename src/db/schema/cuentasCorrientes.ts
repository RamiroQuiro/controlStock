import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  index,
  real,
} from "drizzle-orm/sqlite-core";
import { clientes } from "./clientes";
import { ventas } from "./ventas";
import { empresas } from "./empresas";

export const movimientosCuentaCorriente = sqliteTable(
  "movimientosCuentaCorriente",
  {
    id: text("id").primaryKey(),
    clienteId: text("clienteId")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    empresaId: text("empresaId")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    ventaId: text("ventaId").references(() => ventas.id, {
      onDelete: "set null",
    }),
    monto: real("monto").notNull(), // Monto del movimiento
    tipo: text("tipo", { enum: ["DEUDA", "PAGO"] }).notNull(),
    saldoResultante: real("saldoResultante").notNull(), // Saldo después de este movimiento
    observaciones: text("observaciones"),
    fecha: integer("fecha", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    // index('idx_cc_cliente').on(t.clienteId, t.empresaId),
    // index('idx_cc_fecha').on(t.empresaId, t.fecha),
  ],
);
