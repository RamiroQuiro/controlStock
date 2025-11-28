import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { empresas } from "./empresas";
import { planes } from "./planes";

// Tabla de suscripciones activas (una por empresa)
export const suscripciones = sqliteTable("suscripciones", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id")
    .notNull()
    .references(() => empresas.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => planes.id),

  // Estado de la suscripción
  estado: text("estado").notNull().default("activa"), // activa, vencida, cancelada, prueba

  // Fechas
  fechaInicio: integer("fecha_inicio", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  fechaVencimiento: integer("fecha_vencimiento", {
    mode: "timestamp",
  }).notNull(),

  // Periodo de prueba
  esPrueba: integer("es_prueba", { mode: "boolean" }).notNull().default(false),
  diasPrueba: integer("dias_prueba").default(30),

  // Facturación
  ultimoPago: integer("ultimo_pago", { mode: "timestamp" }),
  proximoPago: integer("proximo_pago", { mode: "timestamp" }),
  metodoPago: text("metodo_pago"), // mercadopago, stripe, transferencia

  // Metadata de pago (para webhooks)
  mercadopagoSubscriptionId: text("mercadopago_subscription_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),

  // Contadores (para optimización)
  cantidadUsuarios: integer("cantidad_usuarios").notNull().default(0),
  cantidadSucursales: integer("cantidad_sucursales").notNull().default(0),

  // Auditoría
  canceladoPor: text("cancelado_por"),
  fechaCancelacion: integer("fecha_cancelacion", { mode: "timestamp" }),
  motivoCancelacion: text("motivo_cancelacion"),

  fechaCreacion: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  fechaActualizacion: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
