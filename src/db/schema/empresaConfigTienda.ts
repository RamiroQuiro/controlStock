// src/db/schema/empresaConfigTienda.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const empresaConfigTienda = sqliteTable('empresa_config_tienda', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  empresaId: text('empresaId').notNull(), // FK a empresas
  plantillaId: integer('plantillaId').notNull(), // FK a plantillas
  colores: text('colores', { mode: 'json' }), // JSON string con colores personalizados
  textos: text('textos', { mode: 'json' }),
  // JSON string con textos fijos
  imagenes: text('imagenes', { mode: 'json' }), // JSON string para imágenes (opcional)
  // Otros campos que quieras agregar
});
