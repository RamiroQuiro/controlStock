import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users, empresas, clientes, proveedores, depositos, usuariosDepositos, puntosDeVenta, comprobantes, comprobanteNumeracion } from "../schema";
import { eq } from "drizzle-orm";
import { normalizadorUUID } from "../../utils/normalizadorUUID";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";

// Cargar variables de entorno manualmente
dotenv.config();

const url = process.env.TURSO_DB_URL;
const authToken = process.env.TURSO_DB_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Error: Faltan las credenciales de Turso en el archivo .env");
  process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client);

// RECREACIÓN DEL SERVICIO (Para que funcione independiente de import.meta.env)
async function inicializarEmpresaManual(user: any) {
    const empresaId = normalizadorUUID("empresa", 15);
    console.log(`🏗️  Creando empresa para ${user.razonSocial}...`);

    // 1. Crear empresa
    await db.insert(empresas).values({
      id: empresaId,
      razonSocial: user.razonSocial,
      creadoPor: user.id,
      userId: user.id,
      activo: 1,
      planId: "plan-emprendedor",
      cantidadUsuarios: 1,
      cantidadSucursales: 1,
      emailVerificado: true,
      srcPhoto: "/avatarDefault.png",
    } as any);

    // 2. Cliente y proveedor por defecto
    console.log("👥 Creando cliente y proveedor por defecto...");
    const [clienteFinal] = await db.insert(clientes).values({
      id: normalizadorUUID("cliente", 15),
      nombre: "consumidor final",
      creadoPor: user.id,
      empresaId,
      dni: 0,
      telefono: "N/A",
      email: "consumidor.final@tuempresa.com",
    } as any).returning();

    const [proveedorGeneral] = await db.insert(proveedores).values({
      id: normalizadorUUID("proveedor", 15),
      nombre: "proveedor general",
      creadoPor: user.id,
      empresaId,
      cuit: 0,
      telefono: "N/A",
      email: "proveedor.general@tuempresa.com",
    } as any).returning();

    // 3. Punto de venta principal
    console.log("🏪 Creando punto de venta...");
    const [puntoVenta] = await db.insert(puntosDeVenta).values({
      id: normalizadorUUID("puntoVenta", 15),
      codigo: 1,
      nombre: "Punto de venta principal",
      tipo: "caja",
      empresaId,
      descripcion: "Punto de venta principal",
    }).returning();

    // 4. Depósito Inicial
    console.log("📦 Inicializando depósito...");
    const depositoId = normalizadorUUID("deposito", 15);
    await db.insert(depositos).values({
        id: depositoId,
        nombre: "Depósito Central",
        empresaId,
        principal: true,
    } as any);

    await db.insert(usuariosDepositos).values({
        usuarioId: user.id,
        depositoId: depositoId,
    });

    return { empresaId, clienteDefault: clienteFinal.id, proveedorDefault: proveedorGeneral.id, depositoDefault: depositoId };
}

async function manualVerify(email: string) {
  console.log(`\n🚀 Iniciando verificación manual para: ${email}...`);

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      console.error(`❌ Error: No se encontró ningún usuario con el email: ${email}`);
      return;
    }

    if (user.emailVerificado && user.empresaId) {
      console.log(`⚠️ Aviso: El usuario ya está verificado y tiene empresa: ${user.empresaId}`);
      return;
    }

    // Ejecutar inicialización
    const { empresaId, clienteDefault, proveedorDefault, depositoDefault } = await inicializarEmpresaManual(user);

    // Actualizar usuario
    await db.update(users).set({
        emailVerificado: true,
        empresaId: empresaId
    }).where(eq(users.id, user.id));

    console.log("\n✅ ¡VERIFICACIÓN EXITOSA!");
    console.log("-----------------------------------------");
    console.log(`📧 Email: ${user.email}`);
    console.log(`🏢 Empresa ID: ${empresaId}`);
    console.log(`📦 Depósito Inicial: ${depositoDefault}`);
    console.log(`👥 Cliente Default: ${clienteDefault}`);
    console.log(`🚚 Proveedor Default: ${proveedorDefault}`);
    console.log("-----------------------------------------");
    console.log("La cuenta ya está activa.");

  } catch (error) {
    console.error("\n❌ Error durante la verificación manual:");
    console.error(error);
  }
}

const targetEmail = "yesicaramonal@gmail.com";
manualVerify(targetEmail);
