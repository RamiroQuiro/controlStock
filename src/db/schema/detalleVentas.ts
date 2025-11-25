import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { empresas, productos, ventas } from "../schema";

export const detalleVentas = sqliteTable(
  "detalleVentas",
  {
    id: text("id").primaryKey(),
    ventaId: text("ventaId")
      .notNull()
      .references(() => ventas.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    productoId: text("productoId")
      .notNull()
      .references(() => productos.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    empresaId: text("empresaId")
      .notNull()
      .references(() => empresas.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    cantidad: integer("cantidad").notNull(),
    precio: integer("precio").notNull(), // Precio unitario en el momento de la venta
    impuesto: integer("impuesto", { mode: "number" }).notNull().default(0), // Impuesto aplicado al producto
    descuento: integer("descuento", { mode: "number" }).notNull().default(0), // Descuento aplicado al producto
    subtotal: integer("subtotal", { mode: "number" }).notNull(), // Subtotal del producto (cantidad * precio - descuento)
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    nComprobante: text("nComprobante").notNull(), // Número de comprobante asociado
  },
  (t) => [
    // Índices para las consultas de top vendidos
    index("idx_detalle_ventas_producto_empresa").on(t.productoId, t.empresaId),
    index("idx_detalle_ventas_cantidad").on(t.cantidad),
    index("idx_detalle_ventas_producto_empresa_cantidad").on(
      t.productoId,
      t.empresaId,
      t.cantidad
    ),
  ]
);
