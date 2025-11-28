import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { traslados } from "./traslados";
import { productos } from "./productos";

/**
 * Detalle de items en un traslado
 * Cada fila representa un producto trasladado
 */
export const detalleTraslados = sqliteTable("detalle_traslados", {
  id: text("id").primaryKey(),

  // Relación con traslado
  trasladoId: text("traslado_id")
    .notNull()
    .references(() => traslados.id, { onDelete: "cascade" }),

  // Producto
  productoId: text("producto_id")
    .notNull()
    .references(() => productos.id),

  // Cantidades
  cantidadSolicitada: real("cantidad_solicitada").notNull(), // Lo que se pidió
  cantidadEnviada: real("cantidad_enviada").notNull(), // Lo que se envió
  cantidadRecibida: real("cantidad_recibida"), // Lo que se recibió (puede diferir)

  // Diferencias
  diferencia: real("diferencia").default(0), // cantidadRecibida - cantidadEnviada
  motivoDiferencia: text("motivo_diferencia"), // rotura, faltante, sobrante

  // Datos del producto (snapshot al momento del traslado)
  nombreProducto: text("nombre_producto").notNull(),
  codigoProducto: text("codigo_producto"),
  unidadMedida: text("unidad_medida").default("unidad"),

  // Observaciones específicas del item
  observaciones: text("observaciones"),

  // Metadata
  fechaCreacion: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
