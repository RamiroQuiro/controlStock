import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { comprasProveedores } from "./comprasProveedor";
import { productos } from "./productos";

export const detalleCompras = sqliteTable("detalleCompras", {
    id: text("id").primaryKey(),
    compraId: text("compraId")
      .notNull()
      .references(() => comprasProveedores.id, { onDelete: "cascade" }), // Relación con la compra
    productoId: text("productoId")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }), // Producto comprado
    cantidad: integer("cantidad").notNull(), // Cantidad comprada
    precioUnitario: integer("precioUnitario", { mode: "number" }).notNull(), // Precio unitario del producto
    subtotal: integer("subtotal", { mode: "number" }).notNull(), // cantidad * precioUnitario
  });
  