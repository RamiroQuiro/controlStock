import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { sql } from "drizzle-orm";
import { proveedores } from "./proveedores";

export const comprasProveedores = sqliteTable("comprasProveedores", {
    id: text("id").primaryKey(),
    userId: text("userId").references(() => users.id), // Usuario que registra la compra
    fecha: integer("fecha") // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    proveedorId: text("proveedorId").references(() => proveedores.id), // Proveedor asociado a la compra
    metodoPago: text("metodoPago").default("efectivo"), // Método de pago usado
    nComprobante: text("nComprobante"), // Número de comprobante de compra
    srcComprobante: text("srcComprobante"), // URL/Path del comprobante digitalizado (opcional)
    nCheque: text("nCheque"), // Número de cheque (si aplica)
    vencimientoCheque: text("vencimientoCheque"), // Fecha de vencimiento del cheque (si aplica)
    total: integer("total", { mode: "number" }).notNull(), // Monto total de la compra
    impuesto: integer("impuesto", { mode: "number" }).notNull().default(0), // IVA aplicado
    descuento: integer("descuento", { mode: "number" }).notNull().default(0), // Descuento total aplicado
  });
  