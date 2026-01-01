import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';
import { empresas } from './empresas';
import { users } from './users';
import { depositos } from './depositos';

// Tabla de Cajas Físicas
export const cajas = sqliteTable('cajas', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  ubicacion: text('ubicacion'), // Descripción física de dónde está
  depositoId: text('depositoId').references(() => depositos.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  activa: integer('activa', { mode: 'boolean' }).default(true),
  empresaId: text('empresaId')
    .notNull()
    .references(() => empresas.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  creadoPor: text('creadoPor').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`),
}, (t) => [
  index('idx_cajas_deposito').on(t.empresaId, t.depositoId),
]);

// Tabla de Sesiones de Caja (Turnos)
export const sesionesCaja = sqliteTable('sesionesCaja', {
  id: text('id').primaryKey(),
  cajaId: text('cajaId')
    .notNull()
    .references(() => cajas.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  usuarioAperturaId: text('usuarioAperturaId')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  fechaApertura: integer('fechaApertura', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  montoInicial: real('montoInicial').notNull().default(0),
  
  fechaCierre: integer('fechaCierre', { mode: 'timestamp' }),
  usuarioCierreId: text('usuarioCierreId').references(() => users.id, { onDelete: 'set null' }),
  
  montoFinalEsperado: real('montoFinalEsperado'), // Calculado por sistema
  montoFinalReal: real('montoFinalReal'),         // Ingresado por usuario (arqueo)
  diferencia: real('diferencia'),                // Real - Esperado
  
  estado: text('estado').notNull().default('abierta'), // 'abierta', 'cerrada'
  empresaId: text('empresaId')
    .notNull()
    .references(() => empresas.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (t) => [
  index('idx_sesiones_caja_empresa').on(t.empresaId, t.estado),
  index('idx_sesiones_usuario').on(t.usuarioAperturaId),
]);

// Tabla de Movimientos de Dinero
export const movimientosCaja = sqliteTable('movimientosCaja', {
  id: text('id').primaryKey(),
  sesionCajaId: text('sesionCajaId')
    .notNull()
    .references(() => sesionesCaja.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  tipo: text('tipo').notNull(), // 'ingreso', 'egreso'
  origen: text('origen').notNull().default('manual'), // 'venta', 'compra', 'gasto', 'retiro', 'ajuste', 'apertura'
  monto: real('monto').notNull(),
  descripcion: text('descripcion'),
  
  referenciaId: text('referenciaId'), // ID de la venta, compra, etc. (Opcional)
  comprobante: text('comprobante'),   // Nro de comprobante si aplica
  
  usuarioId: text('usuarioId')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  
  fecha: integer('fecha', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
    
  empresaId: text('empresaId')
    .notNull()
    .references(() => empresas.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (t) => [
  index('idx_mov_caja_sesion').on(t.sesionCajaId),
  index('idx_mov_caja_fecha').on(t.fecha),
]);
