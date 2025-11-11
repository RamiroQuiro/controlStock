import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, unique, index } from 'drizzle-orm/sqlite-core';
import { proveedores } from './proveedores';
import { empresas } from './empresas';
import { users } from './users';

// Tabla de productos
export const productos = sqliteTable(
  'productos',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    srcPhoto: text('srcPhoto'),
    proveedorId: text('proveedorId').references(() => proveedores.id),
    codigoBarra: text('codigoBarra').notNull(),
    categoria: text('categoria'),
    marca: text('marca'),
    impuesto: text('impuesto').default('21%'),
    deposito: text('deposito').default('deposito 1'),
    ubicacion: text('ubicacion').default('ubicacion 1'),
    empresaId: text('empresaId').notNull().references(() => empresas.id),
    creadoPor: text('creadoPor').references(() => users.id),
    signoDescuento: text('signoDescuento'), // '$' o '%'
    descuento: integer('descuento', { mode: 'number' }).default(0),

    modelo: text('modelo'),
    descripcion: text('descripcion').notNull(),
    pCompra: integer('pCompra', { mode: 'number' }),
    pVenta: integer('pVenta', { mode: 'number' }),
    ventasTotales: integer('ventasTotales', { mode: 'number' }).default(0),
    utilidad: integer('utilidad', { mode: 'number' }),
    stock: integer('stock').notNull().default(0),
    reservado: integer('reservado', { mode: 'number' }).default(0),
    isOferta: integer('isOferta', { mode: 'boolean' }).default(false),
    diasOferta: integer('diasOferta', { mode: 'number' }).default(0),
    precioOferta: integer('precioOferta', { mode: 'number' }).default(0),
    fechaInicioOferta: integer('fechaInicioOferta', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    fechaFinOferta: integer('fechaFinOferta', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    reservadoOffLine: integer('reservadoOffLine', { mode: 'number' }).default(0),
    reservadoOnline: integer('reservadoOnline', { mode: 'number' }).default(0),
    alertaStock: integer('alertaStock', { mode: 'number' }).default(10),
    iva: integer('iva', { mode: 'number' }).default(21),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    unidadMedida: text('unidadMedida').default('unidad'),
    isEcommerce: integer('isEcommerce', { mode: 'boolean' }).default(false),
    precioMinimoVenta: integer('precioMinimoVenta', { mode: 'number' }),
    imagenes: text('imagenes', { mode: 'json' }).default('[]'),
    etiquetas: text('etiquetas', { mode: 'json' }).default('[]'),
    peso: integer('peso', { mode: 'number' }).default(0),
    dimensiones: text('dimensiones', { mode: 'json' }).default('[]'),
    estadoPublicacion: text('estadoPublicacion').default('desactivado'),
    descripcionLarga: text('descripcionLarga'),
    descripcionCorta: text('descripcionCorta'),
    palabrasSEO: text('palabrasSEO'),
    userUpdate: text('userUpdate'),
    ultimaActualizacion: integer('ultimaActualizacion', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (t) => [
    // 🔑 RESTRICCIONES DE UNICIDAD
    unique('uq_producto_codigo_barra_empresa').on(t.codigoBarra, t.empresaId),
    unique('uq_producto_nombre_marca_modelo_empresa').on(t.nombre, t.marca, t.modelo, t.empresaId),

    // 🎯 ÍNDICES PRINCIPALES PARA BÚSQUEDAS CRÍTICAS
    // Búsqueda principal por ID + Empresa (MÁS IMPORTANTE)
    index('idx_producto_id_empresa').on(t.id, t.empresaId),
    
    // Búsqueda por nombre + empresa (para búsquedas generales)
    index('idx_producto_nombre_empresa').on(t.nombre, t.empresaId),
    
    // Búsqueda por código de barras + empresa
    index('idx_producto_codigo_barra_empresa').on(t.codigoBarra, t.empresaId),

    // 🏪 ÍNDICES DE INVENTARIO Y STOCK
    // Para consultas de stock bajo y alertas
    index('idx_producto_stock_alerta').on(t.empresaId, t.stock, t.alertaStock, t.activo),
    
    // Productos activos con stock para ventas
    index('idx_producto_activo_stock').on(t.empresaId, t.activo, t.stock),

    // 📈 ÍNDICES PARA REPORTES Y FILTROS
    // Para reportes de ventas y utilidad
    index('idx_producto_ventas_utilidad').on(t.empresaId, t.ventasTotales, t.utilidad),
    
    // Para búsquedas por categoría y marca
    index('idx_producto_categoria_marca').on(t.empresaId, t.categoria, t.marca),
    
    // Productos en oferta activa
    index('idx_producto_oferta_activa').on(t.empresaId, t.isOferta, t.activo, t.fechaFinOferta),

    // 🛒 ÍNDICES PARA E-COMMERCE
    // Productos disponibles en e-commerce
    index('idx_producto_ecommerce').on(t.empresaId, t.isEcommerce, t.activo, t.stock, t.estadoPublicacion),

    // 🔄 ÍNDICES DE AUDITORÍA Y MANTENIMIENTO
    // Para sincronización y actualizaciones
    index('idx_producto_actualizacion').on(t.empresaId, t.ultimaActualizacion),
    
    // Para consultas por proveedor
    index('idx_producto_proveedor').on(t.empresaId, t.proveedorId),

    // 🗂️ ÍNDICES PARA CONSULTAS ESPECÍFICAS
    // Para consultas de ubicación (si usas estos campos frecuentemente)
    index('idx_producto_ubicacion').on(t.empresaId, t.deposito, t.ubicacion),
     // 🎯 ÍNDICES ESPECÍFICOS PARA obtenerDatosStock
    // Para la consulta principal con empresaId + activo
    index('idx_productos_stock_principal').on(t.empresaId, t.activo, t.id),
    
    // Para ordenamiento por ventas
    index('idx_productos_empresa_activo_ventas').on(t.empresaId, t.activo),
     // 🎯 ÍNDICES CRÍTICOS PARA LA VERSIÓN RÁPIDA
    index('idx_productos_empresa_activo_actualizacion').on(
      t.empresaId, 
      t.activo, 
      t.ultimaActualizacion
    ),
    
    index('idx_productos_empresa_activo_id').on(
      t.empresaId, 
      t.activo, 
      t.id
    ),
  ]

);