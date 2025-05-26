// src/db/schema/empresaConfigTienda.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const empresaConfigTienda = sqliteTable('empresa_config_tienda', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  empresaId: text('empresaId').notNull(), // FK a empresas
  plantillaId: integer('plantillaId').notNull(), // FK a plantillas
  colores: text('colores'), // JSON string con colores personalizados
  textos: text('textos'),

  // JSON string con textos fijos
  imagenes: text('imagenes'), // JSON string para imágenes (opcional)
  // Otros campos que quieras agregar
});
