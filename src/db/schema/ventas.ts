import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { clientes } from './clientes';
import { empresas } from './empresas';
import { comprobantes } from './compobantes';

export const ventas = sqliteTable('ventas', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => users.id),
  empresaId: text('empresaId').references(() => empresas.id),
  fecha: integer('fecha', { mode: 'timestamp' }) // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  clienteId: text('clienteId').references(() => clientes.id),
  metodoPago: text('metodoPago').default('efectivo'),
  nComprobante: text('nComprobante'),
  numeroFormateado: text('numeroFormateado'),
  comprobanteId: text('comprobanteId').references(() => comprobantes.id),
  tipo: text('tipo', {
    enum: ['FC_A', 'FC_B', 'FC_C', 'PR', 'NC'],
  })
    .notNull()
    .default('FC_B'), // 'FC_A', 'FC_B', 'FC_C', 'PR' (Presupuesto), etc.
  puntoVenta: text('puntoVenta').notNull(), // ej. '0001'
  srcComprobante: text('srcComprobante'),
  nCheque: text('nCheque'),
  vencimientoCheque: integer('vencimientoCheque', { mode: 'timestamp' }),
  total: integer('total', { mode: 'number' }).notNull(),
  impuesto: integer('impuesto', { mode: 'number' }).notNull().default(0), // Almacena el total del IVA aplicado
  descuento: integer('descuento', { mode: 'number' }).notNull().default(0), // Almacena el descuento total aplicado
});
