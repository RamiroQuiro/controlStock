ALTER TABLE `cliente` RENAME TO `clientes`;--> statement-breakpoint
ALTER TABLE `movimientos_stock` RENAME TO `movimientosStock`;--> statement-breakpoint
CREATE TABLE `stockActual` (
	`id` text PRIMARY KEY NOT NULL,
	`productoId` text NOT NULL,
	`cantidad` integer DEFAULT 0 NOT NULL,
	`alertaStock` integer DEFAULT 5 NOT NULL,
	`localizacion` text,
	`precioPromedio` integer DEFAULT 0 NOT NULL,
	`reservado` integer DEFAULT 0 NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movimientosStock` (
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
	FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_movimientosStock`("id", "productoId", "cantidad", "tipo", "fecha", "userId", "proveedorId", "clienteId") SELECT "id", "productoId", "cantidad", "tipo", "fecha", "userId", "proveedorId", "clienteId" FROM `movimientosStock`;--> statement-breakpoint
DROP TABLE `movimientosStock`;--> statement-breakpoint
ALTER TABLE `__new_movimientosStock` RENAME TO `movimientosStock`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_productos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text,
	`proveedorId` text,
	`codigoBarra` text NOT NULL,
	`categoria` text,
	`descripcion` text NOT NULL,
	`pCompra` integer,
	`pVenta` integer,
	`utilidad` integer,
	`stock` integer NOT NULL,
	`userUpdate` text,
	`ultimaActualizacion` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_productos`("id", "nombre", "proveedorId", "codigoBarra", "categoria", "descripcion", "pCompra", "pVenta", "utilidad", "stock", "userUpdate", "ultimaActualizacion", "created_at", "userId") SELECT "id", "nombre", "proveedorId", "codigoBarra", "categoria", "descripcion", "pCompra", "pVenta", "utilidad", "stock", "userUpdate", "ultimaActualizacion", "created_at", "userId" FROM `productos`;--> statement-breakpoint
DROP TABLE `productos`;--> statement-breakpoint
ALTER TABLE `__new_productos` RENAME TO `productos`;--> statement-breakpoint
CREATE UNIQUE INDEX `productos_codigoBarra_userId_unique` ON `productos` (`codigoBarra`,`userId`);