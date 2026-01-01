import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core';
import { empresas } from './empresas';
import { users } from './users';
import { sql } from 'drizzle-orm';
import { depositos } from './depositos';
export const ubicaciones = sqliteTable(
  'ubicaciones',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    empresaId: text('empresaId').references(() => empresas.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
    creadoPor: text('creadoPor').references(() => users.id, { onUpdate: 'cascade', onDelete: 'set null' }),
    depositoId: text('depositoId').references(() => depositos.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
    color:text('color').default('bg-blue-500'),
    capacidad:integer('capacidad',{mode:'number'}).default(0),
    zona:text('zona'),
    prioridad:integer('prioridad').default(1),
    pasillo:integer('pasillo'),
    estante:integer('estante'),
    rack:integer('rack'),
    nivel:integer('nivel'),
    fechaCreacion: integer('fechaCreacion', { mode: 'timestamp' }) // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo', { mode: 'boolean' }).default(true),
  },
  (t) => [
    // 🔑 UNICIDAD
    unique('uq_ubicacion_nombre_deposito_empresa').on(t.nombre, t.depositoId, t.empresaId),
    
    // 📊 ÍNDICES PRINCIPALES
    // Búsqueda por empresa y depósito
    index('idx_ubicaciones_empresa_deposito').on(t.empresaId, t.depositoId, t.activo),
    
    // Ubicaciones activas por empresa
    index('idx_ubicaciones_empresa_activo').on(t.empresaId, t.activo),
    
    // Búsqueda por zona dentro de depósito
    index('idx_ubicaciones_zona_deposito').on(t.depositoId, t.zona, t.activo),
    
    // Ordenamiento por prioridad
    index('idx_ubicaciones_prioridad').on(t.empresaId, t.prioridad, t.activo),
    
    // 📍 ÍNDICES PARA UBICACIÓN FÍSICA
    // Búsqueda por coordenadas físicas
    index('idx_ubicaciones_ubicacion_fisica').on(
      t.depositoId, 
      t.pasillo, 
      t.estante, 
      t.rack, 
      t.nivel
    ),
    
    // Capacidad disponible
    index('idx_ubicaciones_capacidad').on(t.empresaId, t.capacidad, t.activo),
  ]
  
);
