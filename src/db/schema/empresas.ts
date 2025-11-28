import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const empresas = sqliteTable(
  "empresas",
  {
    id: text("id").primaryKey(), // UUID
    razonSocial: text("razonSocial").notNull(),
    nombreFantasia: text("nombreFantasia"),
    documento: text("documento"), // CUIT/DNI
    telefono: text("telefono"),
    theme: text("theme").default("clasica"),
    layout: text("layout").default("clasica"),
    nameStyles: text("nameStyles"),
    direccion: text("direccion"),
    email: text("email"),
    colorAsset: text("colorAsset"),
    colorSecundario: text("colorSecundario"),
    userId: text("userId").notNull(), //id del usuario dueño de la empresa
    creadoPor: text("creadoPor"), //ide del user de la empresa
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date()
    ),
    updated_by: text("updated_by"), // Guardará el ID del usuario que actualiza
    activo: integer("activo").default(1),
    emailVerificado: integer("emailVerificado", { mode: "boolean" }).default(
      false
    ),
    srcPhoto: text("srcPhoto"),
    srcLogo: text("srcLogo"),
    urlWeb: text("urlWeb"),
    emailEmpresa: text("emailEmpresa"),

    // 🆕 Campos de suscripción (cache rápido)
    planId: text("plan_id"), // Referencia al plan activo (puede ser null si no tiene plan)
    fechaVencimiento: integer("fecha_vencimiento", { mode: "timestamp" }), // Fecha de vencimiento del plan

    // Contadores de uso (para validación rápida de límites)
    cantidadUsuarios: integer("cantidad_usuarios").notNull().default(0),
    cantidadSucursales: integer("cantidad_sucursales").notNull().default(0),
    cantidadProductos: integer("cantidad_productos").notNull().default(0),
    almacenamientoUsadoMB: integer("almacenamiento_usado_mb")
      .notNull()
      .default(0),
  },
  (t) => [
    unique().on(t.documento, t.emailEmpresa), // una empresa por documento
  ]
);
