import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { proveedores } from "./proveedores";
// Tabla de productos

export const productos = sqliteTable("productos", {
    id: text("id").primaryKey(),
    nombre: text("nombre"),
    proveedorId: text("proveedorId").references(() => proveedores.id),
    codigoBarra:text('codigoBarra'),
    categoria: text("categoria"),
    descripcion:text('descripcion').notNull(),
    pCompra: integer("pCompra", { mode: "number" }),
    pVenta: integer("pVenta", { mode: "number" }),
    utilidad:integer('utilidad',{mode:'number'}),
    stock: integer("stock").notNull(),
    userUpdate:text('userUpdate'),
    ultimaActualizacion: integer("ultimaActualizacion") // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    created_at: integer("created_at") // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  });