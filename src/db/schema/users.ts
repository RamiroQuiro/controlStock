import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';

// Tabla de usuarios
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    userName: text('username').notNull(), // Unique username for login
    nombre: text('nombre').notNull(), // First name
    apellido: text('apellido').notNull(), // Last name
    email: text('email').notNull(),
    password: text('password').notNull(),
    srcPhoto: text('srcPhoto'),
    rol: text('rol', { enum: ['admin', 'vendedor', 'repositor'] })
      .notNull()
      .default('vendedor'), // Opciones: 'admin', 'vendedor', 'repositor'
    razonSocial: text('razonSocial'), // Business name for companies/contractors
    nombreFantasia: text('nombreFantasia'), // Trade name
    tipoUsuario: text('tipoUsuario', {
      enum: ['empleado', 'cliente', 'proveedor'],
    })
      .notNull()
      .default('empleado'), // Opciones: 'empleado', 'cliente', 'proveedor'
    documento: text('documento'), // DNI/CUIT/Tax ID
    telefono: text('telefono'), // Contact phone number
    direccion: text('direccion'), // Business or personal address
    creadoPor: text('creadoPor').references(() => users.id), // Referencia recursiva a la misma tabla
    fechaAlta: integer('created_at') // Timestamp Unix
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    activo: integer('activo').default(1), // Account active status (1 = active, 0 = inactive)
  },
  (t) => [
    // Índice único compuesto para evitar duplicados de email por usuario
    unique().on(t.email, t.creadoPor, t.userName),
  ]
);
