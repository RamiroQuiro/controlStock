// src/scripts/resetDB.ts

import db from "./src/db";
import { ventas, comprasProveedores, productos, stockActual } from "./src/db/schema";

async function resetDB() {
  try {
    await db.delete(ventas);
    await db.delete(comprasProveedores);
    await db.delete(productos);
    await db.delete(stockActual);

    console.log("🧹 Base limpiada. Todo listo para empezar de nuevo.");
  } catch (err) {
    console.error("❌ Error al limpiar la base de datos:", err);
  }
}

resetDB();
