// src/db/schema/plantillas.ts
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const plantillas = sqliteTable('plantillas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(), // Ej: 'Clásica', 'Minimal', 'Moderna'
  descripcion: text('descripcion'), // Descripción corta de la plantilla
  empresaId: text('empresaId').notNull(), //id de la empresa dueña de la plantilla
  creadoPor: text('creadoPor').notNull(), //id del usuario que creó la plantilla
  fechaCreacion: integer('fechaCreacion') // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  slug: text('slug').notNull().unique(),
  theme: text('theme').notNull().default('clasica'),
  path: text('path'), // Path al layout (opcional)
  // Puedes agregar más campos si querés (preview, imagen, etc)
});
