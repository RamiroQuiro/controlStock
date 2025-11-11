import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { productos } from './productos';
import { users } from './users';
import { proveedores } from './proveedores';
import { clientes } from './clientes';
import { empresas } from './empresas';

export const movimientosStock = sqliteTable('movimientosStock', {
  id: text('id').primaryKey(),
  productoId: text('productoId')
    .notNull()
    .references(() => productos.id),
  cantidad: integer('cantidad').notNull(),
  tipo: text('tipo') // 'egreso','ingreso'
    .notNull()
    .default('recarga'),
  fecha: integer('fecha', { mode: 'timestamp' }) // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  empresaId: text('empresaId').references(() => empresas.id),
  proveedorId: text('proveedorId').references(() => proveedores.id),
  motivo: text('motivo'), // 'recarga', 'devolucion', 'vencimiento', 'movimiento','ajustes
  observacion: text('observacion'), // Detalles adicionales opcionales
  clienteId: text('clienteId').references(() => clientes.id),
},
(t) => [
    index('idx_movimientos_producto_tipo').on(t.productoId, t.tipo, t.empresaId),
    index('idx_movimientos_fecha').on(t.fecha),
    index('idx_movimientos_producto').on(t.productoId),
    index('idx_movimientos_usuario').on(t.userId),
    index('idx_movimientos_empresa').on(t.empresaId),
    index('idx_movimientos_proveedor').on(t.proveedorId),
    index('idx_movimientos_cliente').on(t.clienteId),
  ]
);
