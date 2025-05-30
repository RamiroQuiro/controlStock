import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { productos } from './productos';
import { categorias } from './categorias';
import { sql } from 'drizzle-orm';

export const productoCategorias = sqliteTable(
  'producto_categorias',
  {
    id: text('id').primaryKey(),
    productoId: text('productoId')
      .notNull()
      .references(() => productos.id),
    categoriaId: text('categoriaId')
      .notNull()
      .references(() => categorias.id),
    created_at: integer('created_at') // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [unique().on(t.productoId, t.categoriaId)]
);
