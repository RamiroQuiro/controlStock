import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { productos } from "./productos";
import { empresas } from "./empresas";

// Tabla principal de Recetas
// Una receta está vinculada a un producto terminado
export const recetas = sqliteTable(
  "recetas",
  {
    id: text("id").primaryKey(),
    productoId: text("productoId")
      .notNull()
      .references(() => productos.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    empresaId: text("empresaId")
      .notNull()
      .references(() => empresas.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    nombre: text("nombre").notNull(), // Ej: "Receta Pan Francés Estándar"
    rendimiento: integer("rendimiento", { mode: "number" }).notNull().default(1), // Cuánto rinde la receta (ej: 50kg)
    unidadRendimiento: text("unidadRendimiento").default("kg"),
    costoEstimado: integer("costoEstimado", { mode: "number" }).default(0), // Costo calculado según insumos
    instrucciones: text("instrucciones"), // Pasos de preparación
    activo: integer("activo", { mode: "boolean" }).default(true),
    
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    index("idx_recetas_producto").on(t.productoId, t.empresaId),
    index("idx_recetas_empresa").on(t.empresaId),
  ]
);

// Detalle de los ingredientes/insumos de la receta
export const recetaDetalle = sqliteTable(
  "receta_detalle",
  {
    id: text("id").primaryKey(),
    recetaId: text("recetaId")
      .notNull()
      .references(() => recetas.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    insumoId: text("insumoId") // Este es el producto marcado como 'esInsumo'
      .notNull()
      .references(() => productos.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
    cantidad: integer("cantidad", { mode: "number" }).notNull(),
    unidadMedida: text("unidadMedida").notNull(), // kg, gr, l, unidad
    costoHistorico: integer("costoHistorico", { mode: "number" }), // Costo al momento de crear la receta
  },
  (t) => [
    index("idx_detalle_receta").on(t.recetaId),
    index("idx_detalle_insumo").on(t.insumoId),
  ]
);

// Tabla para registrar las órdenes de elaboración/producción
export const ordenesProduccion = sqliteTable(
  "ordenes_produccion",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresaId")
      .notNull()
      .references(() => empresas.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    recetaId: text("recetaId")
      .notNull()
      .references(() => recetas.id),
    userId: text("userId"), // Quién produjo
    cantidadProducida: integer("cantidadProducida", { mode: "number" }).notNull(), // Cuánto se hizo realmente
    costoTotal: integer("costoTotal", { mode: "number" }),
    lote: text("lote"), // Para trazabilidad
    fechaProduccion: integer("fechaProduccion", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    estado: text("estado").default("finalizado"), // planificado, en_proceso, finalizado
    notas: text("notas"),
  },
  (t) => [
    index("idx_ordenes_empresa").on(t.empresaId),
    index("idx_ordenes_fecha").on(t.fechaProduccion),
  ]
);
