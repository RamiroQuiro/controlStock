CREATE TABLE `cliente` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`telefono` text,
	`email` text,
	`direccion` text
);
--> statement-breakpoint
CREATE TABLE `detalle_ventas` (
	`id` text PRIMARY KEY NOT NULL,
	`ventaId` text NOT NULL,
	`productoId` text NOT NULL,
	`cantidad` integer NOT NULL,
	`precio` integer NOT NULL,
	FOREIGN KEY (`ventaId`) REFERENCES `ventas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `movimientos_stock` (
	`id` text PRIMARY KEY NOT NULL,
	`productoId` text NOT NULL,
	`cantidad` integer NOT NULL,
	`tipo` text DEFAULT 'ingreso' NOT NULL,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`userId` text NOT NULL,
	`proveedorId` text,
	`clienteId` text,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`proveedorId` text,
	`categoria` text,
	`precio` integer NOT NULL,
	`stock` integer NOT NULL,
	`ultimaActualizacion` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `proveedores` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`contacto` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`rol` text DEFAULT 'empleado' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ventas` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`total` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
