import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, unique } from "drizzle-orm/sqlite-core";
import { proveedores } from "./proveedores";
import { stockActual } from "./stockActual";
// Tabla de productos

export const productos = sqliteTable("productos",{
    id: text("id").primaryKey(),
    nombre: text("nombre"),
    srcPhoto:text('srcPhoto'),
    proveedorId: text("proveedorId").references(() => proveedores.id),
    codigoBarra: text("codigoBarra").notNull(),
    categoria: text("categoria"),
    descripcion: text("descripcion").notNull(),
    pCompra: integer("pCompra", { mode: "number" }),
    pVenta: integer("pVenta", { mode: "number" }),
    utilidad: integer("utilidad", { mode: "number" }),
    stock: integer("stock").notNull(),
    userUpdate: text("userUpdate"),
    ultimaActualizacion: integer("ultimaActualizacion") // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    created_at: integer("created_at") // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    userId: text("userId").notNull(), // Agregamos userId
  },
  (t) => [
    // Índice único compuesto para evitar duplicados de código de barra por usuario
    unique().on(t.codigoBarra, t.userId),
  ]
);
