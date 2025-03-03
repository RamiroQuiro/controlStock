CREATE TABLE `detalle_presupuesto` (
	`id` text PRIMARY KEY NOT NULL,
	`presupuesto_id` text NOT NULL,
	`producto_id` text NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_unitario` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`descuento` integer DEFAULT 0,
	`impuesto` integer DEFAULT 0,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `presupuesto` (
	`id` text PRIMARY KEY NOT NULL,
	`codigo` text,
	`userId` text,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`clienteId` text,
	`total` integer NOT NULL,
	`impuesto` integer DEFAULT 0 NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	`estado` text DEFAULT 'activo' NOT NULL,
	`expira_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ventas` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`clienteId` text,
	`metodoPago` text DEFAULT 'efectivo',
	`nComprobante` text,
	`srcComprobante` text,
	`nCheque` text,
	`vencimientoCheque` text,
	`total` integer NOT NULL,
	`impuesto` integer DEFAULT 0 NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ventas`("id", "userId", "fecha", "clienteId", "metodoPago", "nComprobante", "srcComprobante", "nCheque", "vencimientoCheque", "total", "impuesto", "descuento") SELECT "id", "userId", "fecha", "clienteId", "metodoPago", "nComprobante", "srcComprobante", "nCheque", "vencimientoCheque", "total", "impuesto", "descuento" FROM `ventas`;--> statement-breakpoint
DROP TABLE `ventas`;--> statement-breakpoint
ALTER TABLE `__new_ventas` RENAME TO `ventas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `productos` ADD `iva` integer DEFAULT 21;