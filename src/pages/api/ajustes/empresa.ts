import type { APIRoute } from 'astro';

// GET para obtener la configuración actual de la empresa
export const GET: APIRoute = async ({ locals }) => {
  const { user } = locals;
  if (!user || !user.empresaId) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const empresaData = await db.query.empresas.findFirst({
      where: eq(empresas.id, user.empresaId),
    });

    if (!empresaData) {
      return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), { status: 404 });
    }

    return new Response(JSON.stringify(empresaData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al obtener la empresa:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};
import { eq } from 'drizzle-orm';
import db from '../../../db';
import { empresas } from '../../../db/schema';

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  if (!user || !user.empresaId) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const { razonSocial, documento, nombreFantasia, telefono, direccion, emailEmpresa } = data;

    if (!razonSocial || !documento) {
      return new Response(JSON.stringify({ error: 'Razón Social y Documento son obligatorios' }), { status: 400 });
    }

    let logoPath: string | undefined = undefined;
    const logoFile = formData.get('logo') as File;

    if (logoFile && logoFile.size > 0) {
      const fileExtension = path.extname(logoFile.name);
      const uniqueFilename = `${user.empresaId}-${Date.now()}${fileExtension}`;
      const logoUploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
      const logoUploadPath = path.join(logoUploadDir, uniqueFilename);
      
      await mkdir(logoUploadDir, { recursive: true });

      await writeFile(logoUploadPath, Buffer.from(await logoFile.arrayBuffer()));
      logoPath = `/uploads/logos/${uniqueFilename}`;
    }

    const updateData: Partial<typeof empresas.$inferInsert> = {
      razonSocial: razonSocial as string,
      documento: documento as string,
      nombreFantasia: nombreFantasia as string,
      telefono: telefono as string,
      direccion: direccion as string,
      emailEmpresa: emailEmpresa as string,
    };

    if (logoPath) {
      updateData.srcLogo = logoPath;
    }

    const [updatedEmpresa] = await db
      .update(empresas)
      .set(updateData)
      .where(eq(empresas.id, user.empresaId))
      .returning();

    if (!updatedEmpresa) {
      return new Response(JSON.stringify({ error: 'Empresa no encontrada al actualizar' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedEmpresa), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error actualizando la empresa:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
