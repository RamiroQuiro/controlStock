PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_productos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text,
	`srcPhoto` text,
	`proveedorId` text,
	`codigoBarra` text NOT NULL,
	`categoria` text,
	`marca` text,
	`impuesto` text DEFAULT '21%',
	`signoDescuento` text,
	`descuento` integer DEFAULT 0,
	`modelo` text,
	`descripcion` text NOT NULL,
	`pCompra` integer,
	`pVenta` integer,
	`utilidad` integer,
	`stock` integer NOT NULL,
	`activo` integer DEFAULT true,
	`unidadMedida` text DEFAULT 'unidad',
	`precioMinimoVenta` integer,
	`userUpdate` text,
	`ultimaActualizacion` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_productos`("id", "nombre", "srcPhoto", "proveedorId", "codigoBarra", "categoria", "marca", "impuesto", "signoDescuento", "descuento", "modelo", "descripcion", "pCompra", "pVenta", "utilidad", "stock", "activo", "unidadMedida", "precioMinimoVenta", "userUpdate", "ultimaActualizacion", "created_at", "userId") SELECT "id", "nombre", "srcPhoto", "proveedorId", "codigoBarra", "categoria", "marca", "impuesto", "signoDescuento", "descuento", "modelo", "descripcion", "pCompra", "pVenta", "utilidad", "stock", "activo", "unidadMedida", "precioMinimoVenta", "userUpdate", "ultimaActualizacion", "created_at", "userId" FROM `productos`;--> statement-breakpoint
DROP TABLE `productos`;--> statement-breakpoint
ALTER TABLE `__new_productos` RENAME TO `productos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `productos_codigoBarra_userId_unique` ON `productos` (`codigoBarra`,`userId`);