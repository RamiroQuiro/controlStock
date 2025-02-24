import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { productos } from "./productos";

export const stockActual = sqliteTable("stockActual", {
  id: text("id").primaryKey(),
  productoId: text("productoId")
    .notNull()
    .references(() => productos.id), // Relación con productos
  cantidad: integer("cantidad").notNull().default(0), // Cantidad actual en stock
  alertaStock: integer("alertaStock").notNull().default(5), // Mínimo antes de alertar
  localizacion: text("localizacion"), // Ubicación en el almacén
  deposito: text("deposito").default("deposito 1"),
  precioPromedio: integer("precioPromedio").notNull().default(0), // Precio promedio de compra
  reservado: integer("reservado").notNull().default(0), // Cantidad reservada para ventas
  stockSeguridad: integer("stockSeguridad").notNull().default(0), // Stock mínimo ideal
  costoTotalStock: integer("costoTotalStock", { mode: "number" }), // Valor total del stock
  updatedBy: text("updatedBy"), // Usuario que actualizó el stock

  updatedAt: integer("updatedAt") // Timestamp Unix para seguimiento de última actualización
    .notNull()
    .default(sql`(strftime('%s', 'now'))`), // Actualiza al modificar stock
});
