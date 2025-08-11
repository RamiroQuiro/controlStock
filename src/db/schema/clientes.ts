import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { empresas } from './empresas';

export const clientes = sqliteTable(
  'clientes',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    telefono: text('telefono'),
    dni: integer('dni', { mode: 'number' }).unique(),
    cuit: integer('cuit', { mode: 'number' }),
    condicionIva: text('condicionIva'),
    email: text('email'),
    direccion: text('direccion'),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    observaciones: text('observaciones'),
    fechaAlta: integer('fechaAlta', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`
    ),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    ultimaCompra: integer('ultimaCompra', { mode: 'timestamp' }),
    categoria: text('categoria').default('regular'),
    estado: text('estado').default('activo'),
    limiteCredito: integer('limiteCredito', { mode: 'number' }).default(0),
    saldoPendiente: integer('saldoPendiente', { mode: 'number' }).default(0),
    diasCredito: integer('diasCredito', { mode: 'number' }).default(0),
    descuentoPreferencial: integer('descuentoPreferencial', {
      mode: 'number',
    }).default(0),
  },
  (t) => [
    // Único para DNI y empresa
    unique().on(t.dni, t.empresaId),

    // Este índice parcial lo hacemos vía SQL crudo porque Drizzle aún no soporta .where() bien con SQLite
    sql`CREATE UNIQUE INDEX IF NOT EXISTS cuit_empresa_unique_not_null 
        ON clientes (cuit, empresaId) 
        WHERE cuit IS NOT NULL`,
  ]
);
