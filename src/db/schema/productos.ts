import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, unique } from "drizzle-orm/sqlite-core";
import { proveedores } from "./proveedores";
// Tabla de productos

export const productos = sqliteTable(
  "productos",
  {
    id: text("id").primaryKey(),
    nombre: text("nombre"),
    srcPhoto: text("srcPhoto"),
    proveedorId: text("proveedorId").references(() => proveedores.id),
    codigoBarra: text("codigoBarra").notNull(),
    categoria: text("categoria"),
    marca: text("marca"),
    impuesto: text("impuesto").default("21%"),
    descuento: text("descuento").default("0%"), // Descuento aplicado al producto "$100" o "10%"
    modelo: text("modelo"),
    descripcion: text("descripcion").notNull(),
    pCompra: integer("pCompra", { mode: "number" }),
    pVenta: integer("pVenta", { mode: "number" }),
    utilidad: integer("utilidad", { mode: "number" }),
    stock: integer("stock").notNull(),
    activo: integer("activo", { mode: "boolean" }).default(true), 
    unidadMedida: text("unidadMedida").default("unidad"), // unidad, kg, litro, etc.
    precioMinimoVenta: integer("precioMinimoVenta", { mode: "number" }),
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
