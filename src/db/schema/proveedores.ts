import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';
import { users } from './users';

// Tabla de proveedores
export const proveedores = sqliteTable(
  'proveedores',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    activo: integer('activo').default(1),
    contacto: text('contacto'),
    dni: integer('dni', { mode: 'number' }),
    celular: text('celular'),
    email: text('email'),
    direccion: text('direccion'),
    estado: text('estado', { enum: ['activo', 'inactivo'] }).default('activo'),
    observaciones: text('observaciones'),
    userId: text('userId').references(() => users.id),
    empresaId: text('empresaId').references(() => users.id),
    creadoPor: text('creadoPor').references(() => users.id),
    created_at: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    // Índice único compuesto para evitar duplicados de dni por usuario
    unique().on(t.dni, t.empresaId),
  ]
);
