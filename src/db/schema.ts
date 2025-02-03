import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Tabla de productos
const productos = sqliteTable("productos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  proveedorId: text("proveedorId").references(() => proveedores.id),
  categoria: text("categoria"),
  precio: integer("precio", { mode: "number" }).notNull(),
  stock: integer("stock").notNull(),
  ultimaActualizacion: integer("ultimaActualizacion") // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  created_at: integer("created_at") // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Tabla de detalle de ventas
const detalleVentas = sqliteTable("detalle_ventas", {
  id: text("id").primaryKey(),
  ventaId: text("ventaId").notNull().references(() => ventas.id),
  productoId: text("productoId").notNull().references(() => productos.id),
  cantidad: integer("cantidad").notNull(),
  precio: integer("precio").notNull(), // Precio del producto en el momento de la venta
});

// Tabla de ventas
const ventas = sqliteTable("ventas", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => users.id),
  fecha: integer("fecha") // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  total: integer("total", { mode: "number" }).notNull(),
});

// Tabla de proveedores
const proveedores = sqliteTable("proveedores", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  contacto: text("contacto"),
  created_at: integer("created_at")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Tabla de clientes
const cliente = sqliteTable("cliente", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono"),
  email: text("email"),
  direccion: text("direccion"),
});

// Tabla de usuarios
const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  rol: text("rol")
    .notNull()
    .default("empleado"), // Opciones: 'admin', 'empleado'
});

// Tabla de movimientos de stock
const movimientosStock = sqliteTable("movimientos_stock", {
  id: text("id").primaryKey(),
  productoId: text("productoId").notNull().references(() => productos.id),
  cantidad: integer("cantidad").notNull(),
  tipo: text("tipo") // 'ingreso' o 'egreso'
    .notNull()
    .default("ingreso"),
  fecha: integer("fecha") // Timestamp Unix
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  userId: text("userId").notNull().references(() => users.id),
  proveedorId: text("proveedorId").references(() => proveedores.id),
  clienteId: text("clienteId").references(() => cliente.id),
});
const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
      userId: text('userId')
          .notNull()
          .references(() => users.id),
      expiresAt:  text('expiresAt').notNull().default(sql`(current_timestamp)`)
    });
  
    

export { productos, ventas, detalleVentas, proveedores, cliente, users, movimientosStock, sessions };
