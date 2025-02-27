ALTER TABLE `detalle_ventas` RENAME TO `detalleVentas`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_detalleVentas` (
	`id` text PRIMARY KEY NOT NULL,
	`ventaId` text NOT NULL,
	`productoId` text NOT NULL,
	`cantidad` integer NOT NULL,
	`precio` integer NOT NULL,
	`impuesto` integer DEFAULT 0 NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`ventaId`) REFERENCES `ventas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_detalleVentas`("id", "ventaId", "productoId", "cantidad", "precio", "impuesto", "descuento") SELECT "id", "ventaId", "productoId", "cantidad", "precio", "impuesto", "descuento" FROM `detalleVentas`;--> statement-breakpoint
DROP TABLE `detalleVentas`;--> statement-breakpoint
ALTER TABLE `__new_detalleVentas` RENAME TO `detalleVentas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `clientes` ADD `userId` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `clientes` ADD `dni` integer;--> statement-breakpoint
ALTER TABLE `clientes` ADD `observaciones` text;--> statement-breakpoint
ALTER TABLE `productos` ADD `impuesto` text DEFAULT '21%';--> statement-breakpoint
ALTER TABLE `productos` ADD `sigoDescuento` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `productos` ADD `descuento` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `productos` ADD `activo` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `productos` ADD `unidadMedida` text DEFAULT 'unidad';--> statement-breakpoint
ALTER TABLE `productos` ADD `precioMinimoVenta` integer;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `dni` integer;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `celular` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `email` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `userId` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `stockActual` ADD `deposito` text DEFAULT 'deposito 1';--> statement-breakpoint
ALTER TABLE `stockActual` ADD `stockSeguridad` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stockActual` ADD `costoTotalStock` integer;--> statement-breakpoint
ALTER TABLE `stockActual` ADD `updatedBy` text;--> statement-breakpoint
ALTER TABLE `ventas` ADD `clienteId` text DEFAULT '00' NOT NULL;--> statement-breakpoint
ALTER TABLE `ventas` ADD `impuesto` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `ventas` ADD `descuento` integer DEFAULT 0 NOT NULL;