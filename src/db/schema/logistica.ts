import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { empresas } from "./empresas";
import { users } from "./users";
import { ventas } from "./ventas";

// Vehículos para reparto
export const vehiculos = sqliteTable(
  "vehiculos",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresaId")
      .notNull()
      .references(() => empresas.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    patente: text("patente").notNull(),
    modelo: text("modelo"),
    choferId: text("choferId").references(() => users.id),
    activo: integer("activo", { mode: "boolean" }).default(true),
  },
  (t) => [index("idx_vehiculos_empresa").on(t.empresaId)]
);

// Hoja de Ruta (Un viaje de reparto)
export const hojasDeRuta = sqliteTable(
  "hojas_de_ruta",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresaId")
      .notNull()
      .references(() => empresas.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    vehiculoId: text("vehiculoId").references(() => vehiculos.id),
    choferId: text("choferId").references(() => users.id),
    fechaSalida: integer("fechaSalida", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    fechaLlegada: integer("fechaLlegada", { mode: "timestamp" }),
    estado: text("estado").default("borrador"), // borrador, en_viaje, finalizada
    kilometrajeInicio: integer("kilometrajeInicio", { mode: "number" }),
    kilometrajeFin: integer("kilometrajeFin", { mode: "number" }),
    notas: text("notas"),
  },
  (t) => [index("idx_hr_empresa").on(t.empresaId)]
);

// Entregas dentro de una hoja de ruta
export const entregasReparto = sqliteTable(
  "entregas_reparto",
  {
    id: text("id").primaryKey(),
    hojaRutaId: text("hojaRutaId")
      .notNull()
      .references(() => hojasDeRuta.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    ventaId: text("ventaId")
      .notNull()
      .references(() => ventas.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    orden: integer("orden", { mode: "number" }), // Orden de visita
    estadoEntrega: text("estadoEntrega").default("pendiente"), // pendiente, entregado, rechazado, ausente
    horaEntrega: integer("horaEntrega", { mode: "timestamp" }),
    observaciones: text("observaciones"),
  },
  (t) => [index("idx_entregas_hr").on(t.hojaRutaId)]
);
