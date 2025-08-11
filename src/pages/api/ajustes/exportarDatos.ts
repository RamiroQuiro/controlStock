import type { APIRoute } from "astro";
import Papa from "papaparse";
import db from "../../../db";
import { clientes, proveedores } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  const empresaId = user?.empresaId;

  if (!empresaId) {
    return new Response("No se pudo identificar la empresa", { status: 401 });
  }

  const url = new URL(request.url);
  const tipo = url.searchParams.get("tipo");

  if (!tipo || (tipo !== 'clientes' && tipo !== 'proveedores')) {
    return new Response("Tipo de exportación no válido. Debe ser 'clientes' o 'proveedores'.", { status: 400 });
  }

  try {
    let data;
    let fileName;

    if (tipo === 'clientes') {
      data = await db.select().from(clientes).where(eq(clientes.empresaId, empresaId));
      fileName = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    } else { // tipo === 'proveedores'
      data = await db.select().from(proveedores).where(eq(proveedores.empresaId, empresaId));
      fileName = `proveedores_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (data.length === 0) {
        return new Response(`No hay ${tipo} para exportar.`, { status: 404 });
    }

    const csv = Papa.unparse(data);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error(`Error al exportar ${tipo}:`, error);
    return new Response(`Error interno al exportar los datos.`, { status: 500 });
  }
};
