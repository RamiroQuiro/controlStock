
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { presupuesto } from "./presupuestos";
import { productos } from "./productos";

// Tabla para los detalles del presupuesto
export const detallePresupuesto = sqliteTable('detallePresupuesto', {
    id: text('id').primaryKey(),
    presupuestoId: text('presupuesto_id')
      .notNull()
      .references(() => presupuesto.id),
    productoId: text('producto_id')
      .notNull()
      .references(() => productos.id),
    cantidad: integer('cantidad', { mode: "number" }).notNull(),
    precioUnitario: integer('precio_unitario', { mode: "number" }).notNull(),
    subtotal: integer('subtotal', { mode: "number" }).notNull(),
    descuento: integer('descuento', { mode: "number" }).default(0),
    impuesto: integer('impuesto', { mode: "number" }).default(0),
  });
  