import { text } from "drizzle-orm/mysql-core";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const puntosDeVenta = sqliteTable('puntosVenta', {
  id: text('id').primaryKey(), // '0001', '0002', etc.
  empresaId: text('empresaId').notNull(),
  descripcion: text('descripcion'),
  nombre: text('nombre').notNull(),
  codigo: integer('codigo',{mode:'number'}).default(1).notNull(), //  1,2,3,etc
  tipo: text('tipo'), // 'caja', 'mostrador', etc.
});
