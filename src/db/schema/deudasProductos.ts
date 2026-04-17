import {
  sqliteTable,
  text,
  real,
  integer,
  index,
} from "drizzle-orm/sqlite-core";
import { clientes } from "./clientes";
import { productos } from "./productos";
import { sql } from "drizzle-orm";

export const deudasProductos = sqliteTable(
  "deudas_productos",
  {
    id: text("id").primaryKey(),
    clienteId: text("clienteId")
      .notNull()
      .references(() => clientes.id),
    productoId: text("productoId")
      .notNull()
      .references(() => productos.id),
    empresaId: text("empresaId").notNull(),
    cantidadPendiente: real("cantidadPendiente").notNull(),
    precioVentaOriginal: real("precioVentaOriginal").notNull(),
    ventaId: text("ventaId"),
    fecha: integer("fecha", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    index("idx_deudas_productos_cliente").on(t.clienteId),
    index("idx_deudas_productos_producto").on(t.productoId),
    index("idx_deudas_productos_empresa").on(t.empresaId),
    index("idx_deudas_productos_fecha").on(t.fecha),
  ],
);
