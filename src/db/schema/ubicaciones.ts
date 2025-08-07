import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { empresas } from './empresas';
import { users } from './users';
import { sql } from 'drizzle-orm';
import { depositos } from './depositos';
export const ubicaciones = sqliteTable(
  'ubicaciones',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    depositoId: text('depositoId').references(() => depositos.id),
    color:text('color').default('bg-blue-500'),
    capacidad:integer('capacidad',{mode:'number'}).default(0),
    zona:text('zona'),
    prioridad:integer('prioridad').default(1),
    pasillo:integer('pasillo'),
    estante:integer('estante'),
    rack:integer('rack'),
    nivel:integer('nivel'),
    fechaCreacion: integer('fechaCreacion', { mode: 'timestamp' }) // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo', { mode: 'boolean' }).default(true),
  },
  (t) => [
    // Índice único compuesto para evitar duplicados de nombre por usuario
    unique().on(t.nombre, t.empresaId,t.depositoId),
  ]
);
