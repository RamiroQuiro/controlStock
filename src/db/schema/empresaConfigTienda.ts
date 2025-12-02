// src/db/schema/empresaConfigTienda.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const empresaConfigTienda = sqliteTable("empresa_config_tienda", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  empresaId: text("empresaId").notNull().unique(), // FK a empresas - único por empresa
  theme: text("theme", { enum: ["clasica", "moderna", "minimal"] })
    .notNull()
    .default("clasica"), // Tema del catálogo
  colores: text("colores", { mode: "json" }), // JSON: { primary: '#xxx', secondary: '#xxx' }
  textos: text("textos", { mode: "json" }), // JSON: { nombreTienda: 'xxx', descripcion: 'xxx' }
  imagenes: text("imagenes", { mode: "json" }), // JSON: { banner: 'url', logo: 'url' }
  activo: integer("activo", { mode: "boolean" }).notNull().default(true), // Si el catálogo está activo
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date()
  ),
});
