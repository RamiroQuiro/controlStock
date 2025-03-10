import db from "./src/db";
import { users, clientes, proveedores } from "./src/db/schema";

async function initializeDatabase() {
  try {
    // Crear usuario admin
    const [adminUser] = await db.insert(users)
      .values({
        id: '1',
        nombre: 'Admin',
        email: 'admin@example.com',
        password: 'hashedPassword',
        rol: 'admin'
      })
      .returning();

    console.log('Usuario Admin creado:', adminUser);

    // Crear cliente consumidor final
    const [defaultClient] = await db.insert(clientes)
      .values({
        id: '1',
        userId: '1', // Relacionado con el admin
        nombre: 'Consumidor Final',
        telefono: '0000000000',
        dni: 0,
        email: 'consumidorfinal@example.com',
        direccion: 'Sin dirección',
        observaciones: 'Cliente por defecto del sistema',
        categoria: 'default',
        estado: 'activo',
        limiteCredito: 0,
        saldoPendiente: 0,
        diasCredito: 0,
        descuentoPreferencial: 0
      })
      .returning();

    console.log('Cliente por defecto creado:', defaultClient);

    // Crear proveedor por defecto
    const [defaultProvider] = await db.insert(proveedores)
      .values({
        id: '1',
        userId: '1', // Relacionado con el admin
        nombre: 'Proveedor Default',
        contacto: 'Sin contacto',
        dni: 0,
        celular: '0000000000',
        email: 'proveedordefault@example.com',
        direccion: 'Sin dirección',
        estado: 'activo',
        observaciones: 'Proveedor por defecto del sistema'
      })
      .returning();

    console.log('Proveedor por defecto creado:', defaultProvider);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Ejecutar la inicialización
initializeDatabase()
  .then(() => {
    console.log('Proceso de inicialización completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el proceso de inicialización:', error);
    process.exit(1);
  });