import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core';
import { empresas } from './empresas';
import { users } from './users';
import { sql } from 'drizzle-orm';

export const depositos = sqliteTable(
  'depositos',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    direccion: text('direccion'),
    telefono: text('telefono'),
    email: text('email'),
    color:text('color').default('bg-blue-500'),
    principal:integer('principal',{mode:'boolean'}).default(false),
    capacidadTotal: integer('capacidadTotal',{mode:'number'}),
    encargado: text('encargado'),

    prioridad: integer('prioridad').default(1),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    fechaCreacion: integer('fechaCreacion', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`
    ),
    activo: integer('activo', { mode: 'boolean' }).default(true),
  },
  (t) => [
     // 🔑 UNICIDAD
    unique('uq_deposito_nombre_empresa').on(t.nombre, t.empresaId),
    
    // 📊 ÍNDICES PARA CONSULTAS FRECUENTES
    // Búsqueda por empresa y estado activo
    index('idx_depositos_empresa_activo').on(t.empresaId, t.activo),
    
    // Depósitos principales por empresa
    index('idx_depositos_principal').on(t.empresaId, t.principal, t.activo),
    
    // Ordenamiento por prioridad
    index('idx_depositos_prioridad').on(t.empresaId, t.prioridad, t.activo),
    
    // Búsqueda rápida por nombre dentro de empresa
    index('idx_depositos_nombre_empresa').on(t.empresaId, t.nombre),
  ]
);
