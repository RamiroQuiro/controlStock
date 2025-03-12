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
    descuento:integer("descuento", { mode: "number" }).notNull().default(0), // Descuento aplicado al producto
    precioReal: integer("precioReal", { mode: "number" }).notNull(), // Precio real del producto que se paga al momento de la compra, sin descuento o referenciado del producto
    pCompra: integer("pCompra", { mode: "number" }).notNull(), // Precio unitario del producto
    subtotal: integer("subtotal", { mode: "number" }).notNull(), // cantidad * precioUnitario
  });
  