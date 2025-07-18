import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { empresas } from './empresas';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const depositos = sqliteTable(
  'depositos',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    direccion: text('direccion'),
    telefono: text('telefono'),
    email: text('email'),
    prioridad: integer('prioridad').default(1),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    fechaCreacion: integer('fechaCreacion', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`
    ),
    activo: integer('activo', { mode: 'boolean' }).default(true),
  },
  (t) => [unique().on(t.nombre, t.empresaId)]
);
