import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const empresas = sqliteTable(
  'empresas',
  {
    id: text('id').primaryKey(), // UUID
    razonSocial: text('razonSocial').notNull(),
    nombreFantasia: text('nombreFantasia'),
    documento: text('documento').notNull(), // CUIT/DNI
    telefono: text('telefono'),
    direccion: text('direccion'),
    email: text('email'),
    creadoPor: text('creadoPor'), // opcional, puede ser userId
    created_at: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo').default(1),
  },
  (t) => [
    unique().on(t.documento), // una empresa por documento
  ]
);
