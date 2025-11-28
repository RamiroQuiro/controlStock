import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

// Tabla de planes disponibles (catálogo de planes)
export const planes = sqliteTable("planes", {
  id: text("id").primaryKey(), // ej: "plan-basico", "plan-profesional"
  nombre: text("nombre").notNull(), // "Plan Básico", "Plan Profesional"
  descripcion: text("descripcion"),

  // Precio
  precioMensual: real("precio_mensual").notNull(), // Precio en pesos/dólares
  moneda: text("moneda").notNull().default("ARS"), // ARS, USD

  // Límites del plan
  limiteUsuarios: integer("limite_usuarios").notNull().default(1),
  limiteSucursales: integer("limite_sucursales").notNull().default(1),
  limiteProductos: integer("limite_productos").default(-1), // -1 = ilimitado

  // Características habilitadas
  rolesPersonalizados: integer("roles_personalizados", { mode: "boolean" })
    .notNull()
    .default(false),
  reportesAvanzados: integer("reportes_avanzados", { mode: "boolean" })
    .notNull()
    .default(false),
  trasladosEntreDepositos: integer("traslados_entre_depositos", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
  catalogoOnline: integer("catalogo_online", { mode: "boolean" })
    .notNull()
    .default(false),

  // Metadata
  activo: integer("activo", { mode: "boolean" }).notNull().default(true), // Si el plan está disponible para venta
  orden: integer("orden").notNull().default(0), // Para ordenar en la UI

  fechaCreacion: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
