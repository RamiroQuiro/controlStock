import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
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
  ubicacionesId: text('ubicacionesId').references(() => ubicaciones.id),
  depositosId: text('depositosId').references(() => depositos.id),
  localizacionesId: text('localizacionesId').references(
    () => localizaciones.id
  ),
  precioPromedio: integer('precioPromedio').notNull().default(0), // Precio promedio de compra
  reservado: integer('reservado').notNull().default(0), // Cantidad reservada para ventas
  stockSeguridad: integer('stockSeguridad').notNull().default(0), // Stock mínimo ideal
  costoTotalStock: integer('costoTotalStock', { mode: 'number' }), // Valor total del stock
  userUltimaReposicion: text('userUltimaReposicion').references(() => users.id), // Usuario que actualizó el stock
  updatedBy: text('updatedBy').references(() => users.id), // Usuario que actualizó el stock
  empresaId: text('empresaId').references(() => empresas.id),
  createdAt: integer('createdAt', { mode: 'timestamp' }) // Timestamp Unix para seguimiento de última actualización
    .notNull()
    .default(sql`(strftime('%s', 'now'))`), // Actualiza al modificar stock
  updatedAt: integer('updatedAt', { mode: 'timestamp' }) // Timestamp Unix para seguimiento de última actualización
    .notNull()
    .default(sql`(strftime('%s', 'now'))`), // Actualiza al modificar stock
  ultimaReposicion: integer('ultimaReposicion', { mode: 'timestamp' }) // Timestamp Unix para seguimiento de última actualización

},(t)=>[
   // 🔑 UNICIDAD - Un producto por ubicación/depósito
    unique('uq_stock_producto_ubicacion').on(t.productoId, t.ubicacionesId, t.empresaId),
    unique('uq_stock_producto_deposito').on(t.productoId, t.depositosId, t.empresaId),
    
    // 📊 ÍNDICES PRINCIPALES
    // Búsqueda principal por producto y empresa
    index('idx_stock_producto_empresa').on(t.productoId, t.empresaId),
    
    // Stock bajo para alertas
    index('idx_stock_alerta').on(t.empresaId, t.cantidad, t.alertaStock),
    
    // Stock por ubicación/depósito
    index('idx_stock_ubicacion_deposito').on(t.empresaId, t.ubicacionesId, t.depositosId),
    
    // 📈 ÍNDICES PARA REPORTES
    // Valoración de inventario
    index('idx_stock_valor_inventario').on(t.empresaId, t.costoTotalStock),
    
    // Productos con stock crítico
    index('idx_stock_critico').on(
      t.empresaId, 
      t.cantidad, 
      t.stockSeguridad, 
      t.alertaStock
    ),
    
    // 🔄 ÍNDICES PARA OPERACIONES
    // Actualizaciones recientes
    index('idx_stock_actualizaciones').on(t.empresaId, t.updatedAt),
    
    // Stock disponible (cantidad - reservado)
    index('idx_stock_disponible').on(t.empresaId, t.cantidad, t.reservado),
    
    // 🏷️ ÍNDICES PARA JOINS
    // Para joins con productos
    index('idx_stock_join_productos').on(t.productoId, t.empresaId, t.cantidad),
]);
