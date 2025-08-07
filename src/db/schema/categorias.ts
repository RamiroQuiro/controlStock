import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { empresas } from './empresas';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const categorias = sqliteTable(
  'categorias',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    creadoPor: text('creadoPor').references(() => users.id),

    empresaId: text('empresaId')
      .notNull()
      .references(() => empresas.id),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    color: text('color').default('bg-blue-500'),
  },
  (t) => [
    unique().on(t.nombre, t.empresaId), // una categoria por nombre y empresa
  ]
);
