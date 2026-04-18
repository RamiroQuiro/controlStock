import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index, unique } from "drizzle-orm/sqlite-core";
import { productos } from "./productos";
import { empresas } from "./empresas";

// Definición de las listas (ej: "Mayorista", "Minorista", "Especial Hoteles")
export const listasPrecios = sqliteTable(
  "listas_precios",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresaId")
      .notNull()
      .references(() => empresas.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion"),
    esDefault: integer("esDefault", { mode: "boolean" }).default(false),
    margenBase: integer("margenBase", { mode: "number" }).default(0), // Por si querés que toda la lista sea "Costo + 50%"
    activo: integer("activo", { mode: "boolean" }).default(true),
    
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    index("idx_listas_empresa").on(t.empresaId),
  ]
);

// Precios específicos de cada producto en cada lista
export const preciosCustom = sqliteTable(
  "precios_custom",
  {
    id: text("id").primaryKey(),
    listaId: text("listaId")
      .notNull()
      .references(() => listasPrecios.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    productoId: text("productoId")
      .notNull()
      .references(() => productos.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    precio: integer("precio", { mode: "number" }).notNull(),
    ultimaActualizacion: integer("ultimaActualizacion", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    index("idx_precios_custom_lista").on(t.listaId),
    index("idx_precios_custom_producto").on(t.productoId),
    unique("uq_lista_producto").on(t.listaId, t.productoId),
  ]
);
