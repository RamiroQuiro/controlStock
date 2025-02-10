PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movimientosStock` (
	`id` text PRIMARY KEY NOT NULL,
	`productoId` text NOT NULL,
	`cantidad` integer NOT NULL,
	`tipo` text DEFAULT 'recarga' NOT NULL,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`userId` text NOT NULL,
	`proveedorId` text,
	`motivo` text,
	`observacion` text,
	`clienteId` text,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_movimientosStock`("id", "productoId", "cantidad", "tipo", "fecha", "userId", "proveedorId", "motivo", "observacion", "clienteId") SELECT "id", "productoId", "cantidad", "tipo", "fecha", "userId", "proveedorId", "motivo", "observacion", "clienteId" FROM `movimientosStock`;--> statement-breakpoint
DROP TABLE `movimientosStock`;--> statement-breakpoint
ALTER TABLE `__new_movimientosStock` RENAME TO `movimientosStock`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `productos` ADD `srcPhoto` text;--> statement-breakpoint
ALTER TABLE `productos` ADD `marca` text;--> statement-breakpoint
ALTER TABLE `productos` ADD `modelo` text;