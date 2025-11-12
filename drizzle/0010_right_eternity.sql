CREATE TABLE `usuariosDepositos` (
	`usuarioId` text NOT NULL,
	`depositoId` text NOT NULL,
	FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depositoId`) REFERENCES `depositos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuariosDepositos_usuarioId_depositoId_unique` ON `usuariosDepositos` (`usuarioId`,`depositoId`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_detalleVentas` (
	`id` text PRIMARY KEY NOT NULL,
	`ventaId` text NOT NULL,
	`productoId` text NOT NULL,
	`empresaId` text NOT NULL,
	`cantidad` integer NOT NULL,
	`precio` integer NOT NULL,
	`impuesto` integer DEFAULT 0 NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	`subtotal` integer NOT NULL,
	`nComprobante` text NOT NULL,
	FOREIGN KEY (`ventaId`) REFERENCES `ventas`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_detalleVentas`("id", "ventaId", "productoId", "empresaId", "cantidad", "precio", "impuesto", "descuento", "subtotal", "nComprobante") SELECT "id", "ventaId", "productoId", "empresaId", "cantidad", "precio", "impuesto", "descuento", "subtotal", "nComprobante" FROM `detalleVentas`;--> statement-breakpoint
DROP TABLE `detalleVentas`;--> statement-breakpoint
ALTER TABLE `__new_detalleVentas` RENAME TO `detalleVentas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_detalle_ventas_producto_empresa` ON `detalleVentas` (`productoId`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_detalle_ventas_cantidad` ON `detalleVentas` (`cantidad`);--> statement-breakpoint
CREATE INDEX `idx_detalle_ventas_producto_empresa_cantidad` ON `detalleVentas` (`productoId`,`empresaId`,`cantidad`);--> statement-breakpoint
DROP INDEX `depositos_nombre_empresaId_unique`;--> statement-breakpoint
ALTER TABLE `depositos` ADD `color` text DEFAULT 'bg-blue-500';--> statement-breakpoint
ALTER TABLE `depositos` ADD `principal` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `depositos` ADD `capacidadTotal` integer;--> statement-breakpoint
ALTER TABLE `depositos` ADD `encargado` text;--> statement-breakpoint
CREATE INDEX `idx_depositos_empresa_activo` ON `depositos` (`empresaId`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_depositos_principal` ON `depositos` (`empresaId`,`principal`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_depositos_prioridad` ON `depositos` (`empresaId`,`prioridad`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_depositos_nombre_empresa` ON `depositos` (`empresaId`,`nombre`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_deposito_nombre_empresa` ON `depositos` (`nombre`,`empresaId`);--> statement-breakpoint
CREATE TABLE `__new_productos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`srcPhoto` text,
	`proveedorId` text,
	`codigoBarra` text NOT NULL,
	`categoria` text,
	`marca` text,
	`impuesto` text DEFAULT '21%',
	`deposito` text DEFAULT 'deposito 1',
	`ubicacion` text DEFAULT 'ubicacion 1',
	`empresaId` text NOT NULL,
	`creadoPor` text,
	`signoDescuento` text,
	`descuento` integer DEFAULT 0,
	`modelo` text,
	`descripcion` text NOT NULL,
	`pCompra` integer,
	`pVenta` integer,
	`ventasTotales` integer DEFAULT 0,
	`utilidad` integer,
	`stock` integer DEFAULT 0 NOT NULL,
	`reservado` integer DEFAULT 0,
	`isOferta` integer DEFAULT false,
	`diasOferta` integer DEFAULT 0,
	`precioOferta` integer DEFAULT 0,
	`fechaInicioOferta` integer DEFAULT (strftime('%s', 'now')),
	`fechaFinOferta` integer DEFAULT (strftime('%s', 'now')),
	`reservadoOffLine` integer DEFAULT 0,
	`reservadoOnline` integer DEFAULT 0,
	`alertaStock` integer DEFAULT 10,
	`iva` integer DEFAULT 21,
	`activo` integer DEFAULT true,
	`unidadMedida` text DEFAULT 'unidad',
	`isEcommerce` integer DEFAULT false,
	`precioMinimoVenta` integer,
	`imagenes` text DEFAULT '[]',
	`etiquetas` text DEFAULT '[]',
	`peso` integer DEFAULT 0,
	`dimensiones` text DEFAULT '[]',
	`estadoPublicacion` text DEFAULT 'desactivado',
	`descripcionLarga` text,
	`descripcionCorta` text,
	`palabrasSEO` text,
	`userUpdate` text,
	`ultimaActualizacion` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creadoPor`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_productos`("id", "nombre", "srcPhoto", "proveedorId", "codigoBarra", "categoria", "marca", "impuesto", "deposito", "ubicacion", "empresaId", "creadoPor", "signoDescuento", "descuento", "modelo", "descripcion", "pCompra", "pVenta", "ventasTotales", "utilidad", "stock", "reservado", "isOferta", "diasOferta", "precioOferta", "fechaInicioOferta", "fechaFinOferta", "reservadoOffLine", "reservadoOnline", "alertaStock", "iva", "activo", "unidadMedida", "isEcommerce", "precioMinimoVenta", "imagenes", "etiquetas", "peso", "dimensiones", "estadoPublicacion", "descripcionLarga", "descripcionCorta", "palabrasSEO", "userUpdate", "ultimaActualizacion", "created_at") SELECT "id", "nombre", "srcPhoto", "proveedorId", "codigoBarra", "categoria", "marca", "impuesto", "deposito", "ubicacion", "empresaId", "creadoPor", "signoDescuento", "descuento", "modelo", "descripcion", "pCompra", "pVenta", "ventasTotales", "utilidad", "stock", "reservado", "isOferta", "diasOferta", "precioOferta", "fechaInicioOferta", "fechaFinOferta", "reservadoOffLine", "reservadoOnline", "alertaStock", "iva", "activo", "unidadMedida", "isEcommerce", "precioMinimoVenta", "imagenes", "etiquetas", "peso", "dimensiones", "estadoPublicacion", "descripcionLarga", "descripcionCorta", "palabrasSEO", "userUpdate", "ultimaActualizacion", "created_at" FROM `productos`;--> statement-breakpoint
DROP TABLE `productos`;--> statement-breakpoint
ALTER TABLE `__new_productos` RENAME TO `productos`;--> statement-breakpoint
CREATE INDEX `idx_producto_id_empresa` ON `productos` (`id`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_producto_nombre_empresa` ON `productos` (`nombre`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_producto_codigo_barra_empresa` ON `productos` (`codigoBarra`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_producto_stock_alerta` ON `productos` (`empresaId`,`stock`,`alertaStock`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_producto_activo_stock` ON `productos` (`empresaId`,`activo`,`stock`);--> statement-breakpoint
CREATE INDEX `idx_producto_ventas_utilidad` ON `productos` (`empresaId`,`ventasTotales`,`utilidad`);--> statement-breakpoint
CREATE INDEX `idx_producto_categoria_marca` ON `productos` (`empresaId`,`categoria`,`marca`);--> statement-breakpoint
CREATE INDEX `idx_producto_oferta_activa` ON `productos` (`empresaId`,`isOferta`,`activo`,`fechaFinOferta`);--> statement-breakpoint
CREATE INDEX `idx_producto_ecommerce` ON `productos` (`empresaId`,`isEcommerce`,`activo`,`stock`,`estadoPublicacion`);--> statement-breakpoint
CREATE INDEX `idx_producto_actualizacion` ON `productos` (`empresaId`,`ultimaActualizacion`);--> statement-breakpoint
CREATE INDEX `idx_producto_proveedor` ON `productos` (`empresaId`,`proveedorId`);--> statement-breakpoint
CREATE INDEX `idx_producto_ubicacion` ON `productos` (`empresaId`,`deposito`,`ubicacion`);--> statement-breakpoint
CREATE INDEX `idx_productos_stock_principal` ON `productos` (`empresaId`,`activo`,`id`);--> statement-breakpoint
CREATE INDEX `idx_productos_empresa_activo_ventas` ON `productos` (`empresaId`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_productos_empresa_activo_actualizacion` ON `productos` (`empresaId`,`activo`,`ultimaActualizacion`);--> statement-breakpoint
CREATE INDEX `idx_productos_empresa_activo_id` ON `productos` (`empresaId`,`activo`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_producto_codigo_barra_empresa` ON `productos` (`codigoBarra`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_producto_nombre_marca_modelo_empresa` ON `productos` (`nombre`,`marca`,`modelo`,`empresaId`);--> statement-breakpoint
DROP INDEX `ubicaciones_nombre_empresaId_unique`;--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `depositoId` text REFERENCES depositos(id);--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `color` text DEFAULT 'bg-blue-500';--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `capacidad` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `zona` text;--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `prioridad` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `pasillo` integer;--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `estante` integer;--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `rack` integer;--> statement-breakpoint
ALTER TABLE `ubicaciones` ADD `nivel` integer;--> statement-breakpoint
CREATE INDEX `idx_ubicaciones_empresa_deposito` ON `ubicaciones` (`empresaId`,`depositoId`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_ubicaciones_empresa_activo` ON `ubicaciones` (`empresaId`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_ubicaciones_zona_deposito` ON `ubicaciones` (`depositoId`,`zona`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_ubicaciones_prioridad` ON `ubicaciones` (`empresaId`,`prioridad`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_ubicaciones_ubicacion_fisica` ON `ubicaciones` (`depositoId`,`pasillo`,`estante`,`rack`,`nivel`);--> statement-breakpoint
CREATE INDEX `idx_ubicaciones_capacidad` ON `ubicaciones` (`empresaId`,`capacidad`,`activo`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_ubicacion_nombre_deposito_empresa` ON `ubicaciones` (`nombre`,`depositoId`,`empresaId`);--> statement-breakpoint
DROP INDEX "categorias_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "clientes_dni_unique";--> statement-breakpoint
DROP INDEX "clientes_dni_empresaId_unique";--> statement-breakpoint
DROP INDEX "comprobanteNumeracion_empresaId_tipo_puntoVenta_unique";--> statement-breakpoint
DROP INDEX "idx_depositos_empresa_activo";--> statement-breakpoint
DROP INDEX "idx_depositos_principal";--> statement-breakpoint
DROP INDEX "idx_depositos_prioridad";--> statement-breakpoint
DROP INDEX "idx_depositos_nombre_empresa";--> statement-breakpoint
DROP INDEX "uq_deposito_nombre_empresa";--> statement-breakpoint
DROP INDEX "idx_detalle_ventas_producto_empresa";--> statement-breakpoint
DROP INDEX "idx_detalle_ventas_cantidad";--> statement-breakpoint
DROP INDEX "idx_detalle_ventas_producto_empresa_cantidad";--> statement-breakpoint
DROP INDEX "empresas_documento_emailEmpresa_unique";--> statement-breakpoint
DROP INDEX "localizaciones_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "idx_movimientos_producto_tipo";--> statement-breakpoint
DROP INDEX "idx_movimientos_fecha";--> statement-breakpoint
DROP INDEX "idx_movimientos_producto";--> statement-breakpoint
DROP INDEX "idx_movimientos_usuario";--> statement-breakpoint
DROP INDEX "idx_movimientos_empresa";--> statement-breakpoint
DROP INDEX "idx_movimientos_proveedor";--> statement-breakpoint
DROP INDEX "idx_movimientos_cliente";--> statement-breakpoint
DROP INDEX "plantillas_slug_unique";--> statement-breakpoint
DROP INDEX "productoCategorias_productoId_categoriaId_unique";--> statement-breakpoint
DROP INDEX "idx_producto_id_empresa";--> statement-breakpoint
DROP INDEX "idx_producto_nombre_empresa";--> statement-breakpoint
DROP INDEX "idx_producto_codigo_barra_empresa";--> statement-breakpoint
DROP INDEX "idx_producto_stock_alerta";--> statement-breakpoint
DROP INDEX "idx_producto_activo_stock";--> statement-breakpoint
DROP INDEX "idx_producto_ventas_utilidad";--> statement-breakpoint
DROP INDEX "idx_producto_categoria_marca";--> statement-breakpoint
DROP INDEX "idx_producto_oferta_activa";--> statement-breakpoint
DROP INDEX "idx_producto_ecommerce";--> statement-breakpoint
DROP INDEX "idx_producto_actualizacion";--> statement-breakpoint
DROP INDEX "idx_producto_proveedor";--> statement-breakpoint
DROP INDEX "idx_producto_ubicacion";--> statement-breakpoint
DROP INDEX "idx_productos_stock_principal";--> statement-breakpoint
DROP INDEX "idx_productos_empresa_activo_ventas";--> statement-breakpoint
DROP INDEX "idx_productos_empresa_activo_actualizacion";--> statement-breakpoint
DROP INDEX "idx_productos_empresa_activo_id";--> statement-breakpoint
DROP INDEX "uq_producto_codigo_barra_empresa";--> statement-breakpoint
DROP INDEX "uq_producto_nombre_marca_modelo_empresa";--> statement-breakpoint
DROP INDEX "proveedores_dni_empresaId_unique";--> statement-breakpoint
DROP INDEX "roles_id_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "idx_stock_producto_empresa";--> statement-breakpoint
DROP INDEX "idx_stock_alerta";--> statement-breakpoint
DROP INDEX "idx_stock_ubicacion_deposito";--> statement-breakpoint
DROP INDEX "idx_stock_valor_inventario";--> statement-breakpoint
DROP INDEX "idx_stock_critico";--> statement-breakpoint
DROP INDEX "idx_stock_actualizaciones";--> statement-breakpoint
DROP INDEX "idx_stock_disponible";--> statement-breakpoint
DROP INDEX "idx_stock_join_productos";--> statement-breakpoint
DROP INDEX "uq_stock_producto_ubicacion";--> statement-breakpoint
DROP INDEX "uq_stock_producto_deposito";--> statement-breakpoint
DROP INDEX "idx_ubicaciones_empresa_deposito";--> statement-breakpoint
DROP INDEX "idx_ubicaciones_empresa_activo";--> statement-breakpoint
DROP INDEX "idx_ubicaciones_zona_deposito";--> statement-breakpoint
DROP INDEX "idx_ubicaciones_prioridad";--> statement-breakpoint
DROP INDEX "idx_ubicaciones_ubicacion_fisica";--> statement-breakpoint
DROP INDEX "idx_ubicaciones_capacidad";--> statement-breakpoint
DROP INDEX "uq_ubicacion_nombre_deposito_empresa";--> statement-breakpoint
DROP INDEX "users_email_creadoPor_username_unique";--> statement-breakpoint
DROP INDEX "usuariosDepositos_usuarioId_depositoId_unique";--> statement-breakpoint
ALTER TABLE `categorias` ALTER COLUMN "activo" TO "activo" integer DEFAULT true;--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_nombre_empresaId_unique` ON `categorias` (`nombre`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_dni_unique` ON `clientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_dni_empresaId_unique` ON `clientes` (`dni`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `comprobanteNumeracion_empresaId_tipo_puntoVenta_unique` ON `comprobanteNumeracion` (`empresaId`,`tipo`,`puntoVenta`);--> statement-breakpoint
CREATE UNIQUE INDEX `empresas_documento_emailEmpresa_unique` ON `empresas` (`documento`,`emailEmpresa`);--> statement-breakpoint
CREATE UNIQUE INDEX `localizaciones_nombre_empresaId_unique` ON `localizaciones` (`nombre`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_producto_tipo` ON `movimientosStock` (`productoId`,`tipo`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_fecha` ON `movimientosStock` (`fecha`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_producto` ON `movimientosStock` (`productoId`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_usuario` ON `movimientosStock` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_empresa` ON `movimientosStock` (`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_proveedor` ON `movimientosStock` (`proveedorId`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_cliente` ON `movimientosStock` (`clienteId`);--> statement-breakpoint
CREATE UNIQUE INDEX `plantillas_slug_unique` ON `plantillas` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `productoCategorias_productoId_categoriaId_unique` ON `productoCategorias` (`productoId`,`categoriaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `proveedores_dni_empresaId_unique` ON `proveedores` (`dni`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `roles_id_nombre_empresaId_unique` ON `roles` (`id`,`nombre`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_stock_producto_empresa` ON `stockActual` (`productoId`,`empresaId`);--> statement-breakpoint
CREATE INDEX `idx_stock_alerta` ON `stockActual` (`empresaId`,`cantidad`,`alertaStock`);--> statement-breakpoint
CREATE INDEX `idx_stock_ubicacion_deposito` ON `stockActual` (`empresaId`,`ubicacionesId`,`depositosId`);--> statement-breakpoint
CREATE INDEX `idx_stock_valor_inventario` ON `stockActual` (`empresaId`,`costoTotalStock`);--> statement-breakpoint
CREATE INDEX `idx_stock_critico` ON `stockActual` (`empresaId`,`cantidad`,`stockSeguridad`,`alertaStock`);--> statement-breakpoint
CREATE INDEX `idx_stock_actualizaciones` ON `stockActual` (`empresaId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `idx_stock_disponible` ON `stockActual` (`empresaId`,`cantidad`,`reservado`);--> statement-breakpoint
CREATE INDEX `idx_stock_join_productos` ON `stockActual` (`productoId`,`empresaId`,`cantidad`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stock_producto_ubicacion` ON `stockActual` (`productoId`,`ubicacionesId`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stock_producto_deposito` ON `stockActual` (`productoId`,`depositosId`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_creadoPor_username_unique` ON `users` (`email`,`creadoPor`,`username`);--> statement-breakpoint
ALTER TABLE `categorias` ADD `color` text DEFAULT 'bg-blue-500';--> statement-breakpoint
ALTER TABLE `clientes` ALTER COLUMN "activo" TO "activo" integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `clientes` ADD `cuit` integer;--> statement-breakpoint
ALTER TABLE `clientes` ADD `condicionIva` text;--> statement-breakpoint
ALTER TABLE `proveedores` ALTER COLUMN "activo" TO "activo" integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `condicionIva` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `domicilio` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `web` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `telefono` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `categorias` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `cuit` integer;--> statement-breakpoint
ALTER TABLE `empresas` ADD `colorAsset` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `colorSecundario` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `empresas` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `stockActual` ADD `userUltimaReposicion` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `stockActual` ADD `ultimaReposicion` integer;--> statement-breakpoint
ALTER TABLE `stockActual` DROP COLUMN `localizacion`;--> statement-breakpoint
ALTER TABLE `stockActual` DROP COLUMN `deposito`;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer;