ALTER TABLE `productos` ADD `codigoBarra` text;--> statement-breakpoint
ALTER TABLE `productos` ADD `descripcion` text;--> statement-breakpoint
ALTER TABLE `productos` ADD `pCompra` integer;--> statement-breakpoint
ALTER TABLE `productos` ADD `pVenta` integer;--> statement-breakpoint
ALTER TABLE `productos` ADD `utilidad` integer;--> statement-breakpoint
ALTER TABLE `productos` ADD `userUpdate` text;--> statement-breakpoint
ALTER TABLE `productos` DROP COLUMN `precio`;