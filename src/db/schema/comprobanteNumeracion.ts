import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey, unique } from 'drizzle-orm/sqlite-core';
import { use } from 'react';
import { users } from './users';

export const comprobanteNumeracion = sqliteTable(
  "comprobanteNumeracion",
  {
    empresaId: text("empresaId").notNull(),
      tipo: text("tipo",{enum: ["FC_A", "FC_B", "FC_C", "PR", "NC","RECIBO", "PRESUPUESTO"]})
    .notNull()
    .default("FC_B"), // 'FC_A', 'FC_B', 'FC_C', 'PR' (Presupuesto), etc.
    puntoVenta: integer("puntoVenta", { mode: "number" }).notNull(), // ej. '0001'
    activo: integer("activo").notNull().default(1), // 1 para activo, 0 para inactivo
    create_at: integer("create_at", { mode: "timestamp" }).default(
       sql`(strftime('%s', 'now'))`
     ),
     update_at: integer("update_at", { mode: "timestamp" }),
    userId: text("userId").references(()=>users.id), // Usuario que creó la numeración
    descripcion: text("descripcion").notNull().default(""), // Descripción opcional
    numeroActual: integer("numero_actual").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [unique().on(t.empresaId, t.tipo, t.puntoVenta)]
);


