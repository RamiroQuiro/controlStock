import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const empresas = sqliteTable(
  'empresas',
  {
    id: text('id').primaryKey(), // UUID
    razonSocial: text('razonSocial').notNull(),
    nombreFantasia: text('nombreFantasia'),
    documento: text('documento'), // CUIT/DNI
    telefono: text('telefono'),
    theme: text('theme').default('clasica'),
    layout: text('layout').default('clasica'),
    nameStyles: text('nameStyles'),
    direccion: text('direccion'),
    email: text('email'),
    userId: text('userId').notNull(), //id del usuario dueño de la empresa
    creadoPor: text('creadoPor'), //ide del user de la empresa
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo').default(1),
    emailVerificado: integer('emailVerificado', { mode: 'boolean' }).default(
      false
    ),
    srcPhoto: text('srcPhoto'),
    srcLogo: text('srcLogo'),
    urlWeb: text('urlWeb'),
    emailEmpresa: text('emailEmpresa'),
  },
  (t) => [
    unique().on(t.documento, t.emailEmpresa), // una empresa por documento
  ]
);
