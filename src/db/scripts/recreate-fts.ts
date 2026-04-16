import db from "../index";
import { sql } from "drizzle-orm";

async function recreateFTS() {
  console.log("🛠️ Recreando tabla virtual FTS para búsquedas...");
  try {
    // 1. Borrar todas las tablas virtuales viejas
    await db.run(sql`DROP TABLE IF EXISTS productos_fts;`);

    // 2. Crear la nueva tabla virtual con las columnas nuevas
    await db.run(
      sql`
      CREATE VIRTUAL TABLE productos_fts USING fts5(
        id, 
        nombre, 
        descripcion, 
        marca, 
        categoria, 
        codigoBarra, 
        descripcionLarga, 
        descripcionCorta, 
        palabrasSEO, 
        empresaId, 
        activo
      );
    `
    );

    console.log("✅ Tabla productos_fts actualizada correctamente.");

    // Opcional: Podrías hacer un script que vuelva a llenar la tabla desde `productos`
    // INSERT INTO productos_fts SELECT id, nombre... FROM productos
    console.log("💡 Sugerencia: Repoblar la tabla si es necesario.");
  } catch (error) {
    console.error("❌ Error al recrear FTS:", error);
  }
}

recreateFTS();
