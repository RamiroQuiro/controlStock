CREATE TABLE `categorias` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`creadoPor` text,
	`empresaId` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`activo` integer DEFAULT 1,
	FOREIGN KEY (`creadoPor`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_nombre_empresaId_unique` ON `categorias` (`nombre`,`empresaId`);--> statement-breakpoint
CREATE TABLE `comprobantes` (
	`id` text PRIMARY KEY NOT NULL,
	`empresaId` text NOT NULL,
	`ventaId` text,
	`tipo` text DEFAULT 'FC_B' NOT NULL,
	`puntoVenta` text NOT NULL,
	`fechaEmision` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`numero` integer NOT NULL,
	`numeroFormateado` text NOT NULL,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`clienteId` text,
	`total` integer,
	`estado` text DEFAULT 'emitido' NOT NULL,
	`cae` text,
	`caeVencimiento` integer,
	`observaciones` text,
	`create_at` integer DEFAULT (strftime('%s', 'now')),
	`update_at` integer
);
--> statement-breakpoint
CREATE TABLE `comprasProveedores` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`empresaId` text,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`proveedorId` text,
	`metodoPago` text DEFAULT 'efectivo',
	`nComprobante` text,
	`srcComprobante` text,
	`nCheque` text,
	`vencimientoCheque` integer,
	`total` integer NOT NULL,
	`impuesto` integer DEFAULT 0 NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comprobanteNumeracion` (
	`empresaId` text NOT NULL,
	`tipo` text DEFAULT 'FC_B' NOT NULL,
	`puntoVenta` integer NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`create_at` integer DEFAULT (strftime('%s', 'now')),
	`update_at` integer,
	`userId` text,
	`descripcion` text DEFAULT '' NOT NULL,
	`numero_actual` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comprobanteNumeracion_empresaId_tipo_puntoVenta_unique` ON `comprobanteNumeracion` (`empresaId`,`tipo`,`puntoVenta`);--> statement-breakpoint
CREATE TABLE `depositos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`direccion` text,
	`telefono` text,
	`email` text,
	`prioridad` integer DEFAULT 1,
	`empresaId` text,
	`creadoPor` text,
	`fechaCreacion` integer DEFAULT (strftime('%s', 'now')),
	`activo` integer DEFAULT true,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creadoPor`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `depositos_nombre_empresaId_unique` ON `depositos` (`nombre`,`empresaId`);--> statement-breakpoint
CREATE TABLE `detalleCompras` (
	`id` text PRIMARY KEY NOT NULL,
	`compraId` text NOT NULL,
	`productoId` text NOT NULL,
	`cantidad` integer NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	`precioReal` integer NOT NULL,
	`pCompra` integer NOT NULL,
	`subtotal` integer NOT NULL,
	FOREIGN KEY (`compraId`) REFERENCES `comprasProveedores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `empresa_config_tienda` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`empresaId` text NOT NULL,
	`plantillaId` integer NOT NULL,
	`colores` text,
	`textos` text,
	`imagenes` text
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` text PRIMARY KEY NOT NULL,
	`razonSocial` text NOT NULL,
	`nombreFantasia` text,
	`documento` text,
	`telefono` text,
	`theme` text DEFAULT 'clasica',
	`layout` text DEFAULT 'clasica',
	`nameStyles` text,
	`direccion` text,
	`email` text,
	`userId` text NOT NULL,
	`creadoPor` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`activo` integer DEFAULT 1,
	`emailVerificado` integer DEFAULT false,
	`srcPhoto` text,
	`srcLogo` text,
	`urlWeb` text,
	`emailEmpresa` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `empresas_documento_emailEmpresa_unique` ON `empresas` (`documento`,`emailEmpresa`);--> statement-breakpoint
CREATE TABLE `localizaciones` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`empresaId` text,
	`creadoPor` text,
	`fechaCreacion` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`activo` integer DEFAULT true,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creadoPor`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `localizaciones_nombre_empresaId_unique` ON `localizaciones` (`nombre`,`empresaId`);--> statement-breakpoint
CREATE TABLE `plantillas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`empresaId` text NOT NULL,
	`creadoPor` text NOT NULL,
	`fechaCreacion` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`slug` text NOT NULL,
	`theme` text DEFAULT 'clasica' NOT NULL,
	`path` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plantillas_slug_unique` ON `plantillas` (`slug`);--> statement-breakpoint
CREATE TABLE `productoCategorias` (
	`id` text PRIMARY KEY NOT NULL,
	`productoId` text NOT NULL,
	`categoriaId` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `productoCategorias_productoId_categoriaId_unique` ON `productoCategorias` (`productoId`,`categoriaId`);--> statement-breakpoint
CREATE TABLE `puntosVenta` (
	`id` text PRIMARY KEY NOT NULL,
	`empresaId` text NOT NULL,
	`descripcion` text,
	`nombre` text NOT NULL,
	`codigo` integer DEFAULT 1 NOT NULL,
	`tipo` text
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`permisos` text,
	`creadoPor` text,
	`empresaId` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`creadoPor`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_id_nombre_empresaId_unique` ON `roles` (`id`,`nombre`,`empresaId`);--> statement-breakpoint
CREATE TABLE `ubicaciones` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`empresaId` text,
	`creadoPor` text,
	`fechaCreacion` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`activo` integer DEFAULT true,
	FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creadoPor`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ubicaciones_nombre_empresaId_unique` ON `ubicaciones` (`nombre`,`empresaId`);--> statement-breakpoint
DROP INDEX `productos_codigoBarra_userId_unique`;--> statement-breakpoint
ALTER TABLE `productos` ADD `deposito` text DEFAULT 'deposito 1';--> statement-breakpoint
ALTER TABLE `productos` ADD `ubicacion` text DEFAULT 'ubicacion 1';--> statement-breakpoint
ALTER TABLE `productos` ADD `empresaId` text REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `productos` ADD `creadoPor` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `productos` ADD `ventasTotales` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `reservado` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `isOferta` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `productos` ADD `diasOferta` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `precioOferta` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `fechaInicioOferta` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `fechaFinOferta` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `reservadoOffLine` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `reservadoOnline` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `alertaStock` integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE `productos` ADD `isEcommerce` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `productos` ADD `imagenes` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `productos` ADD `etiquetas` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `productos` ADD `peso` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `dimensiones` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `productos` ADD `estadoPublicacion` text DEFAULT 'desactivado';--> statement-breakpoint
ALTER TABLE `productos` ADD `descripcionLarga` text;--> statement-breakpoint
ALTER TABLE `productos` ADD `descripcionCorta` text;--> statement-breakpoint
ALTER TABLE `productos` ADD `palabrasSEO` text;--> statement-breakpoint
CREATE UNIQUE INDEX `productos_codigoBarra_empresaId_unique` ON `productos` (`codigoBarra`,`empresaId`);--> statement-breakpoint
ALTER TABLE `productos` DROP COLUMN `userId`;--> statement-breakpoint
DROP INDEX "categorias_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "clientes_dni_unique";--> statement-breakpoint
DROP INDEX "clientes_dni_empresaId_unique";--> statement-breakpoint
DROP INDEX "comprobanteNumeracion_empresaId_tipo_puntoVenta_unique";--> statement-breakpoint
DROP INDEX "depositos_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "empresas_documento_emailEmpresa_unique";--> statement-breakpoint
DROP INDEX "localizaciones_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "plantillas_slug_unique";--> statement-breakpoint
DROP INDEX "productoCategorias_productoId_categoriaId_unique";--> statement-breakpoint
DROP INDEX "productos_codigoBarra_empresaId_unique";--> statement-breakpoint
DROP INDEX "proveedores_dni_empresaId_unique";--> statement-breakpoint
DROP INDEX "roles_id_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "ubicaciones_nombre_empresaId_unique";--> statement-breakpoint
DROP INDEX "users_email_creadoPor_username_unique";--> statement-breakpoint
ALTER TABLE `clientes` ALTER COLUMN "ultimaCompra" TO "ultimaCompra" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_dni_unique` ON `clientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_dni_empresaId_unique` ON `clientes` (`dni`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `proveedores_dni_empresaId_unique` ON `proveedores` (`dni`,`empresaId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_creadoPor_username_unique` ON `users` (`email`,`creadoPor`,`username`);--> statement-breakpoint
ALTER TABLE `clientes` ADD `empresaId` text REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `clientes` ADD `creadoPor` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `clientes` ADD `activo` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `clientes` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "rol" TO "rol" text NOT NULL DEFAULT 'vendedor';--> statement-breakpoint
ALTER TABLE `users` ADD `username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `apellido` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `srcPhoto` text;--> statement-breakpoint
ALTER TABLE `users` ADD `razonSocial` text;--> statement-breakpoint
ALTER TABLE `users` ADD `nombreFantasia` text;--> statement-breakpoint
ALTER TABLE `users` ADD `tipoUsuario` text DEFAULT 'empleado' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `documento` text;--> statement-breakpoint
ALTER TABLE `users` ADD `telefono` text;--> statement-breakpoint
ALTER TABLE `users` ADD `direccion` text;--> statement-breakpoint
ALTER TABLE `users` ADD `creadoPor` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `users` ADD `empresaId` text DEFAULT 'null' REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `activo` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificado` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `ventas` ALTER COLUMN "vencimientoCheque" TO "vencimientoCheque" integer;--> statement-breakpoint
ALTER TABLE `ventas` ADD `empresaId` text REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `ventas` ADD `numeroFormateado` text;--> statement-breakpoint
ALTER TABLE `ventas` ADD `comprobanteId` text REFERENCES comprobantes(id);--> statement-breakpoint
ALTER TABLE `ventas` ADD `tipo` text DEFAULT 'FC_B' NOT NULL;--> statement-breakpoint
ALTER TABLE `ventas` ADD `puntoVenta` text NOT NULL;--> statement-breakpoint
ALTER TABLE `detallePresupuesto` ADD `nComprobante` text NOT NULL;--> statement-breakpoint
ALTER TABLE `detalleVentas` ADD `subtotal` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `detalleVentas` ADD `nComprobante` text NOT NULL;--> statement-breakpoint
ALTER TABLE `movimientosStock` ADD `empresaId` text REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `presupuesto` ADD `empresaId` text REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `presupuesto` ADD `numeroFormateado` text NOT NULL;--> statement-breakpoint
ALTER TABLE `presupuesto` ADD `puntoVenta` text NOT NULL;--> statement-breakpoint
ALTER TABLE `presupuesto` ADD `comprobanteId` text REFERENCES comprobantes(id);--> statement-breakpoint
ALTER TABLE `presupuesto` ADD `nComprobante` text NOT NULL;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `activo` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `observaciones` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `empresaId` text REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `proveedores` ADD `creadoPor` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `proveedores` DROP COLUMN `obeservaciones`;--> statement-breakpoint
ALTER TABLE `proveedores` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `stockActual` ADD `ubicacionesId` text REFERENCES ubicaciones(id);--> statement-breakpoint
ALTER TABLE `stockActual` ADD `depositosId` text REFERENCES depositos(id);--> statement-breakpoint
ALTER TABLE `stockActual` ADD `localizacionesId` text REFERENCES localizaciones(id);--> statement-breakpoint
ALTER TABLE `stockActual` ADD `empresaId` text REFERENCES empresas(id);--> statement-breakpoint
ALTER TABLE `stockActual` ADD `createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL;--> statement-breakpoint
ALTER TABLE `stockActual` ALTER COLUMN "updatedBy" TO "updatedBy" text REFERENCES users(id) ON DELETE no action ON UPDATE no action;