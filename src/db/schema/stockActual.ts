import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { productos } from "./productos";

export const stockActual = sqliteTable("stockActual", {
    id: text("id").primaryKey(),
    productoId: text("productoId").notNull().references(() => productos.id), // Relación con productos
    cantidad: integer("cantidad").notNull().default(0), // Cantidad actual en stock
    alertaStock: integer("alertaStock").notNull().default(5), // Mínimo antes de alertar
    localizacion: text("localizacion"), // Ubicación en el almacén
    deposito:text("deposito").default('deposito 1'),
    precioPromedio: integer("precioPromedio").notNull().default(0), // Precio promedio de compra 
    reservado: integer("reservado").notNull().default(0), // Cantidad reservada para ventas
    updatedAt: integer("updatedAt") // Timestamp Unix para seguimiento de última actualización
      .notNull()
      .default(sql`(strftime('%s', 'now'))`), // Actualiza al modificar stock
  });
  