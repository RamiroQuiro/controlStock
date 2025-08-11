import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { empresas } from './empresas';

// Tabla de proveedores
export const proveedores = sqliteTable(
  'proveedores',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    contacto: text('contacto'),
    dni: integer('dni', { mode: 'number' }),
    condicionIva: text('condicionIva'),
    celular: text('celular'),
    email: text('email'),
    direccion: text('direccion'),
    cuit: integer('cuit', { mode: 'number' }),
    estado: text('estado', { enum: ['activo', 'inactivo'] }).default('activo'),
    observaciones: text('observaciones'),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    // Único para DNI y empresa
    unique().on(t.dni, t.empresaId),

    // Este índice parcial lo hacemos vía SQL crudo porque Drizzle aún no soporta .where() bien con SQLite
    sql`CREATE UNIQUE INDEX IF NOT EXISTS cuit_empresa_unique_not_null 
        ON proveedores (cuit, empresaId) 
        WHERE cuit IS NOT NULL`,
  ]
);
