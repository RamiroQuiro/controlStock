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
    email: text('email'),
    direccion: text('direccion'),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    observaciones: text('observaciones'),
    fechaAlta: integer('fechaAlta').default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo', { mode: 'number' }).default(1),
    ultimaCompra: text('ultimaCompra'),
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
    // Índice único compuesto para evitar duplicados de dni por usuario
    unique().on(t.dni, t.empresaId),
  ]
);
