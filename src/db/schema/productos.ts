import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';
import { proveedores } from './proveedores';
import { empresas } from './empresas';
import { users } from './users';
// Tabla de productos

export const productos = sqliteTable(
  'productos',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre'),
    srcPhoto: text('srcPhoto'),
    proveedorId: text('proveedorId').references(() => proveedores.id),
    codigoBarra: text('codigoBarra').notNull(),
    categoria: text('categoria'),
    marca: text('marca'),
    impuesto: text('impuesto').default('21%'),
    deposito: text('deposito').default('deposito 1'),
    ubicacion: text('ubicacion').default('ubicacion 1'),
    empresaId: text('empresaId').references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    signoDescuento: text('signoDescuento'), //signos de descuento si hay , '$' o '%', si es monto o porcentaje
    descuento: integer('descuento', { mode: 'number' }).default(0), // Descuento aplicado al producto "100" o "10"
    modelo: text('modelo'),
    descripcion: text('descripcion').notNull(),
    pCompra: integer('pCompra', { mode: 'number' }),
    pVenta: integer('pVenta', { mode: 'number' }),
    utilidad: integer('utilidad', { mode: 'number' }),
    stock: integer('stock').notNull(),
    alertaStock: integer('alertaStock', { mode: 'number' }).default(10),
    iva: integer('iva', { mode: 'number' }).default(21), // IVA aplicado al producto "21" o "10"o"27"
    activo: integer('activo', { mode: 'boolean' }).default(true),
    unidadMedida: text('unidadMedida').default('unidad'), // unidad, kg, litro, etc.
    isEcommerce: integer('isEcommerce', { mode: 'boolean' }).default(false),
    precioMinimoVenta: integer('precioMinimoVenta', { mode: 'number' }),
    userUpdate: text('userUpdate'),
    ultimaActualizacion: integer('ultimaActualizacion') // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    created_at: integer('created_at') // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    // Índice único compuesto para evitar duplicados de código de barra por usuario
    unique().on(t.codigoBarra, t.empresaId),
  ]
);
