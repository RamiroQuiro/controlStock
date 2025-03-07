ALTER TABLE `detalle_presupuesto` RENAME TO `detallePresupuesto`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_detallePresupuesto` (
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
INSERT INTO `__new_detallePresupuesto`("id", "presupuesto_id", "producto_id", "cantidad", "precio_unitario", "subtotal", "descuento", "impuesto") SELECT "id", "presupuesto_id", "producto_id", "cantidad", "precio_unitario", "subtotal", "descuento", "impuesto" FROM `detallePresupuesto`;--> statement-breakpoint
DROP TABLE `detallePresupuesto`;--> statement-breakpoint
ALTER TABLE `__new_detallePresupuesto` RENAME TO `detallePresupuesto`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `clientes` ADD `fechaAlta` integer DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `clientes` ADD `ultimaCompra` text;--> statement-breakpoint
ALTER TABLE `clientes` ADD `categoria` text DEFAULT 'regular';--> statement-breakpoint
ALTER TABLE `clientes` ADD `estado` text DEFAULT 'activo';--> statement-breakpoint
ALTER TABLE `clientes` ADD `limiteCredito` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `clientes` ADD `saldoPendiente` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `clientes` ADD `diasCredito` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `clientes` ADD `descuentoPreferencial` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `direccion` text;--> statement-breakpoint
ALTER TABLE `proveedores` ADD `estado` text DEFAULT 'activo';--> statement-breakpoint
ALTER TABLE `proveedores` ADD `obeservaciones` text;