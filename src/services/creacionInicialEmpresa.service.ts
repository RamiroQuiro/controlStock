import fs from "fs/promises";
import { generateId } from "lucia";
import path from "path";
import db from "../db";
import {
  clientes,
  comprobanteNumeracion,
  comprobantes,
  empresas,
  proveedores,
  puntosDeVenta,
  usuariosDepositos,
} from "../db/schema";
import { inicializarRoles } from "./roles.sevice";
import { inciarCategoria } from "./categoriaInicial.service";
import { ubicacionesInicial } from "./ubicacionesInicial.service";
import { depositoInicial } from "./depositoInicial.service";

export async function inicializarEmpresaParaUsuario(user: any) {
  const empresaId = generateId(13);

  // 1. Crear empresa
  const newEmpresa = (
    await db
      .insert(empresas)
      .values({
        id: empresaId,
        created_at: new Date(),
        razonSocial: user.razonSocial,
        creadoPor: user.id,
        userId: user.id,
        activo: 1,
        emailVerificado: true,
        srcPhoto: "/avatarDefault.png",
      })
      .returning()
  ).at(0);

  // 2. Cliente y proveedor por defecto
  const clienteFinal = (
    await db
      .insert(clientes)
      .values({
        id: generateId(13),
        nombre: "consumidor final",
        creadoPor: user.id,
        empresaId,
        telefono: "N/A",
        email: "consumidor.final@tuempresa.com",
        direccion: "N/A",
        fechaAlta: new Date(),
      })
      .returning()
  ).at(0);

  const proveedorGeneral = (
    await db
      .insert(proveedores)
      .values({
        id: generateId(13),
        nombre: "proveedor general",
        creadoPor: user.id,
        empresaId,
        telefono: "N/A",
        email: "proveedor.general@tuempresa.com",
        direccion: "N/A",
        created_at: new Date(),
      })
      .returning()
  ).at(0);

  // 3. Punto de venta principal
  const [puntoVenta] = await db
    .insert(puntosDeVenta)
    .values({
      id: generateId(13),
      codigo: 1,
      nombre: "Punto de venta principal",
      tipo: "caja",
      empresaId,
      descripcion: "Punto de venta principal",
    })
    .returning();

  // 4. Tipos de comprobantes
  const tiposComprobantes = [
    { tipo: "FC_A", descripcion: "Factura A" },
    { tipo: "FC_B", descripcion: "Factura B" },
    { tipo: "FC_C", descripcion: "Factura C" },
    { tipo: "RECIBO", descripcion: "Recibo de pago" },
    { tipo: "NC", descripcion: "Nota de crédito estándar" },
    { tipo: "PRESUPUESTO", descripcion: "Presupuesto estándar" },
    {
      tipo: "REMITO_TRASLADO",
      descripcion: "Remito de traslado entre sucursales",
    },
  ];

  for (const comp of tiposComprobantes) {
    await db.insert(comprobantes).values({
      id: generateId(13),
      empresaId,
      tipo: comp.tipo,
      descripcion: comp.descripcion,
      puntoVenta: puntoVenta.id,
      numero: 1,
      numeroFormateado: `${comp.tipo}-${puntoVenta.codigo}-00000001`, // Formato: FC-A-0001-00000001
      fecha: new Date(),
      estado: "emitido",
      activo: 1,
      creadoPor: user.id,
    });

    await db.insert(comprobanteNumeracion).values({
      empresaId,
      tipo: comp.tipo,
      puntoVenta: 1,
      userId: user?.id,
      numeroActual: 0,
      updatedAt: new Date(),
    });
  }
  // 5. Inicializacion de roles
  await inicializarRoles(user.id, empresaId);
  // 6. Inicializacion de categoria
  await inciarCategoria(empresaId, user.id);
  // 7. Inicializacion de ubicaciones
  await ubicacionesInicial(empresaId, user.id);
  // 8. Inicializacion de depositos
  const depositoCasaCentral = await depositoInicial(empresaId, user.id);

  // 9. Relacionar usuario con Casa Central
  await db.insert(usuariosDepositos).values({
    usuarioId: user.id,
    depositoId: depositoCasaCentral.id,
  });

  // 9. Crear carpeta para imágenes
  const empresaDir = path.join(
    process.cwd(),
    "element",
    "imgs",
    empresaId,
    "productos"
  );
  await fs.mkdir(empresaDir, { recursive: true });

  // 9. Retornar info útil
  return {
    depositoDefault: depositoCasaCentral?.id,
    empresaId: empresaId,
    clienteDefault: clienteFinal?.id,
    proveedorDefault: proveedorGeneral?.id,
    puntoVenta: puntoVenta?.id,
  };
}
