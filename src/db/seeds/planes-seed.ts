import "dotenv/config"; // Cargar variables de entorno
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { planes } from "../schema/planes";

// Crear conexión directa (sin import.meta.env)
const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN!,
});

const db = drizzle(client);

/**
 * Seed de planes iniciales del sistema
 * Ejecutar con: tsx src/db/seeds/planes-seed.ts
 */
export async function seedPlanes() {
  console.log("🌱 Seeding planes...");

  const planesIniciales = [
    {
      id: "plan-emprendedor",
      nombre: "Plan Emprendedor",
      descripcion:
        "Ideal para emprendimientos y pequeños negocios que recién arrancan",
      precioMensual: 9900, // ARS
      moneda: "ARS",
      limiteUsuarios: 1,
      limiteSucursales: 1,
      limiteProductos: 200,
      rolesPersonalizados: false,
      reportesAvanzados: false,
      trasladosEntreDepositos: false,
      catalogoOnline: false,
      activo: true,
      orden: 1,
    },
    {
      id: "plan-basico",
      nombre: "Plan Básico",
      descripcion: "Para negocios en crecimiento con equipo pequeño",
      precioMensual: 18500, // ARS
      moneda: "ARS",
      limiteUsuarios: 3,
      limiteSucursales: 2,
      limiteProductos: 500,
      rolesPersonalizados: true,
      reportesAvanzados: true,
      trasladosEntreDepositos: false,
      catalogoOnline: false,
      activo: true,
      orden: 2,
    },
    {
      id: "plan-profesional",
      nombre: "Plan Profesional",
      descripcion:
        "Solución completa para negocios establecidos con múltiples sucursales",
      precioMensual: 35000, // ARS
      moneda: "ARS",
      limiteUsuarios: 10,
      limiteSucursales: 5,
      limiteProductos: 2000,
      rolesPersonalizados: true,
      reportesAvanzados: true,
      trasladosEntreDepositos: true,
      catalogoOnline: true,
      activo: true,
      orden: 3,
    },
    {
      id: "plan-empresarial",
      nombre: "Plan Empresarial",
      descripcion:
        "Para cadenas y empresas grandes. Máxima capacidad y funcionalidades",
      precioMensual: 65000, // ARS
      moneda: "ARS",
      limiteUsuarios: 20,
      limiteSucursales: 15,
      limiteProductos: 5000,
      rolesPersonalizados: true,
      reportesAvanzados: true,
      trasladosEntreDepositos: true,
      catalogoOnline: true,
      activo: true,
      orden: 4,
    },
  ];

  try {
    // Insertar planes (o actualizar si ya existen)
    for (const plan of planesIniciales) {
      await db
        .insert(planes)
        .values(plan)
        .onConflictDoUpdate({
          target: planes.id,
          set: {
            nombre: plan.nombre,
            descripcion: plan.descripcion,
            precioMensual: plan.precioMensual,
            limiteUsuarios: plan.limiteUsuarios,
            limiteSucursales: plan.limiteSucursales,
            limiteProductos: plan.limiteProductos,
            rolesPersonalizados: plan.rolesPersonalizados,
            reportesAvanzados: plan.reportesAvanzados,
            trasladosEntreDepositos: plan.trasladosEntreDepositos,
            catalogoOnline: plan.catalogoOnline,
            orden: plan.orden,
          },
        });

      console.log(
        `✅ Plan "${plan.nombre}" - $${plan.precioMensual.toLocaleString("es-AR")}/mes`
      );
    }

    console.log("\n🎉 Planes seeded exitosamente!");
    console.log("\n📊 Resumen de planes:");
    console.log(
      "┌─────────────────┬──────────┬──────────┬───────────┬──────────┐"
    );
    console.log(
      "│ Plan            │ Precio   │ Usuarios │ Sucursales│ Productos│"
    );
    console.log(
      "├─────────────────┼──────────┼──────────┼───────────┼──────────┤"
    );
    planesIniciales.forEach((p) => {
      console.log(
        `│ ${p.nombre.padEnd(15)} │ $${String(p.precioMensual).padStart(7)} │ ${String(p.limiteUsuarios).padStart(8)} │ ${String(p.limiteSucursales).padStart(10)} │ ${String(p.limiteProductos).padStart(9)} │`
      );
    });
    console.log(
      "└─────────────────┴──────────┴──────────┴───────────┴──────────┘"
    );
  } catch (error) {
    console.error("❌ Error seeding planes:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
seedPlanes()
  .then(() => {
    console.log("\n✨ Seed completado. Cerrando conexión...");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
