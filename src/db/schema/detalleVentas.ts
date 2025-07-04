import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { productos, ventas } from "../schema";


export const detalleVentas = sqliteTable("detalleVentas", {
  id: text("id").primaryKey(),
  ventaId: text("ventaId").notNull().references(() => ventas.id),
  productoId: text("productoId").notNull().references(() => productos.id),
  cantidad: integer("cantidad").notNull(),
  precio: integer("precio").notNull(), // Precio unitario en el momento de la venta
  impuesto: integer("impuesto", { mode: "number" }).notNull().default(0), // Impuesto aplicado al producto
  descuento: integer("descuento", { mode: "number" }).notNull().default(0), // Descuento aplicado al producto
  subtotal: integer("subtotal", { mode: "number" }).notNull(), // Subtotal del producto (cantidad * precio - descuento)

  nComprobante: text("nComprobante").notNull(), // Número de comprobante asociado
});
