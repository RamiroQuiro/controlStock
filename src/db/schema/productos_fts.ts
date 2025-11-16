// en tu schema.ts o donde definas las demás tablas
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// En tu db/schema.ts
export const productosFts = sqliteTable("productos_fts", {
  id: text("id").notNull(),
  nombre: text("nombre"),
  descripcion: text("descripcion"),
  marca: text("marca"),
  categoria: text("categoria"),
  codigoBarra: text("codigoBarra"),
  descripcionLarga: text("descripcionLarga"),
  descripcionCorta: text("descripcionCorta"),
  palabrasSEO: text("palabrasSEO"),
  empresaId: text("empresaId"),        // 👈 NUEVO
  activo: integer("activo", { mode: "boolean" }), // 👈 NUEVO
});