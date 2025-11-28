import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { depositos } from "./depositos";
import { users } from "./users";
import { empresas } from "./empresas";

/**
 * Tabla de traslados entre sucursales/depósitos
 * Representa un remito de traslado de mercadería
 */
export const traslados = sqliteTable("traslados", {
  id: text("id").primaryKey(),

  // Empresa
  empresaId: text("empresa_id")
    .notNull()
    .references(() => empresas.id),

  // Origen y Destino
  depositoOrigenId: text("deposito_origen_id")
    .notNull()
    .references(() => depositos.id),
  depositoDestinoId: text("deposito_destino_id")
    .notNull()
    .references(() => depositos.id),

  // Número de remito (auto-incremental por empresa)
  numeroRemito: text("numero_remito").notNull(),

  // Estado del traslado
  estado: text("estado").notNull().default("pendiente"),
  // Estados: pendiente, en_transito, recibido, cancelado

  // Fechas
  fechaCreacion: integer("fecha_creacion", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  fechaEnvio: integer("fecha_envio", { mode: "timestamp" }),
  fechaRecepcion: integer("fecha_recepcion", { mode: "timestamp" }),

  // Usuarios involucrados
  creadoPor: text("creado_por")
    .notNull()
    .references(() => users.id),
  enviadoPor: text("enviado_por").references(() => users.id),
  recibidoPor: text("recibido_por").references(() => users.id),

  // Observaciones
  observaciones: text("observaciones"),
  motivoTraslado: text("motivo_traslado"), // reposicion, devolucion, ajuste, etc.

  // Totales (calculados)
  cantidadItems: integer("cantidad_items").notNull().default(0),
  cantidadTotal: real("cantidad_total").notNull().default(0), // Suma de cantidades

  // Metadata
  canceladoPor: text("cancelado_por").references(() => users.id),
  motivoCancelacion: text("motivo_cancelacion"),
  fechaCancelacion: integer("fecha_cancelacion", { mode: "timestamp" }),

  fechaActualizacion: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
