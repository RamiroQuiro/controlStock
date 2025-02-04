import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { productos, ventas } from "../schema";


// Tabla de detalle de ventas
export const detalleVentas = sqliteTable("detalle_ventas", {
    id: text("id").primaryKey(),
    ventaId: text("ventaId").notNull().references(() => ventas.id),
    productoId: text("productoId").notNull().references(() => productos.id),
    cantidad: integer("cantidad").notNull(),
    precio: integer("precio").notNull(), // Precio del producto en el momento de la venta
  });
  