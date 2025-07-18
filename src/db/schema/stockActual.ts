import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { productos } from './productos';
import { users } from './users';
import { empresas } from './empresas';
import { ubicaciones } from './ubicaciones';
import { depositos } from './depositos';
import { localizaciones } from './localizacion';

export const stockActual = sqliteTable('stockActual', {
  id: text('id').primaryKey(),
  productoId: text('productoId')
    .notNull()
    .references(() => productos.id), // Relación con productos
  cantidad: integer('cantidad').notNull().default(0), // Cantidad actual en stock

  alertaStock: integer('alertaStock').notNull().default(5), // Mínimo antes de alertar
  localizacion: text('localizacion'), // Ubicación en el almacén
  deposito: text('deposito').default('deposito 1'),
  ubicacionesId: text('ubicacionesId').references(() => ubicaciones.id),
  depositosId: text('depositosId').references(() => depositos.id),
  localizacionesId: text('localizacionesId').references(
    () => localizaciones.id
  ),
  precioPromedio: integer('precioPromedio').notNull().default(0), // Precio promedio de compra
  reservado: integer('reservado').notNull().default(0), // Cantidad reservada para ventas
  stockSeguridad: integer('stockSeguridad').notNull().default(0), // Stock mínimo ideal
  costoTotalStock: integer('costoTotalStock', { mode: 'number' }), // Valor total del stock
  updatedBy: text('updatedBy').references(() => users.id), // Usuario que actualizó el stock
  empresaId: text('empresaId').references(() => empresas.id),
  createdAt: integer('createdAt', { mode: 'timestamp' }) // Timestamp Unix para seguimiento de última actualización
    .notNull()
    .default(sql`(strftime('%s', 'now'))`), // Actualiza al modificar stock
  updatedAt: integer('updatedAt', { mode: 'timestamp' }) // Timestamp Unix para seguimiento de última actualización
    .notNull()
    .default(sql`(strftime('%s', 'now'))`), // Actualiza al modificar stock
});
