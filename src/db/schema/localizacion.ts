import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { empresas } from './empresas';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const localizaciones = sqliteTable(
  'localizaciones',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    fechaCreacion: integer('fechaCreacion', { mode: 'timestamp' }) // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo', { mode: 'boolean' }).default(true),
  },
  (t) => [
    // Índice único compuesto para evitar duplicados de nombre por usuario
    unique().on(t.nombre, t.empresaId),
  ]
);
