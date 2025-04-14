ALTER TABLE `proveedores` RENAME COLUMN "obeservaciones" TO "observaciones";--> statement-breakpoint
CREATE TABLE `comprasProveedores` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`proveedorId` text,
	`metodoPago` text DEFAULT 'efectivo',
	`nComprobante` text,
	`srcComprobante` text,
	`nCheque` text,
	`vencimientoCheque` text,
	`total` integer NOT NULL,
	`impuesto` integer DEFAULT 0 NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE UNIQUE INDEX `proveedores_dni_unique` ON `proveedores` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `proveedores_dni_userId_unique` ON `proveedores` (`dni`,`userId`);--> statement-breakpoint
ALTER TABLE `productos` ADD `alertaStock` integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE `users` ADD `username` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `apellido` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `razonSocial` text;--> statement-breakpoint
ALTER TABLE `users` ADD `nombreFantasia` text;--> statement-breakpoint
ALTER TABLE `users` ADD `tipoUsuario` text DEFAULT 'empleado' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `documento` text;--> statement-breakpoint
ALTER TABLE `users` ADD `telefono` text;--> statement-breakpoint
ALTER TABLE `users` ADD `direccion` text;--> statement-breakpoint
ALTER TABLE `users` ADD `fechaAlta` text DEFAULT date('now');--> statement-breakpoint
ALTER TABLE `users` ADD `activo` integer DEFAULT 1;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_dni_unique` ON `clientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_dni_userId_unique` ON `clientes` (`dni`,`userId`);