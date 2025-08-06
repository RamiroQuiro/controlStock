import type { APIRoute } from 'astro';

// GET para obtener la configuración actual de la empresa
// export const GET: APIRoute = async ({ locals }) => {
//   const { user } = locals;
//   if (!user || !user.empresaId) {
//     return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
//   }

//   try {
//     const empresaData = await db.query.empresas.findFirst({
//       where: eq(empresas.id, user.empresaId),
//     });

//     if (!empresaData) {
//       return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), { status: 404 });
//     }

//     return new Response(JSON.stringify(empresaData), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Error al obtener la empresa:', error);
//     return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
//   }
// };
import { eq } from 'drizzle-orm';
import db from '../../../db';
import { empresas } from '../../../db/schema';

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createResponse } from '../../../types';
import { convertirASegundos, getFechaUnix } from '../../../utils/timeUtils';

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
export const GET:APIRoute= async ({request,locals})=>{
  const url = new URL(request.url);
  const {user}=locals
  const queryEmpresa = url.searchParams.get('empresaId');

  console.log(queryEmpresa)
    
    try {
        const empresaData = (await db.select().from(empresas).where(eq(empresas.id, queryEmpresa))).at(0)
        console.log(empresaData)
        return createResponse(200,'Empresa obtenida correctamente', empresaData);
    } catch (error) {
        console.error('Error al obtener la empresa:', error);
        return createResponse(500, 'Error interno del servidor',error);
    }
} 

export const PUT: APIRoute = async ({ request, locals }) => {
    const { user } = locals;

    if (!user || !user.empresaId) {
        return createResponse(401, { error: 'No autorizado' });
    }

    try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);

        const { razonSocial, documento, nombreFantasia, telefono, direccion, emailEmpresa, colorAsset, colorSecundario } = data;

        if (!razonSocial || !documento) {
            return createResponse(400, 'Razón Social y Documento son obligatorios');
        }

        const updateData: Partial<typeof empresas.$inferInsert> = {
            razonSocial: razonSocial as string,
            documento: documento as string,
            nombreFantasia: nombreFantasia as string,
            telefono: telefono as string,
            direccion: direccion as string,
            emailEmpresa: emailEmpresa as string,
            colorAsset: colorAsset as string,
            colorSecundario: colorSecundario as string,
            updated_at: new Date(getFechaUnix()),
            updated_by: user.id, // Guardamos el ID del usuario que actualiza
        };

        const logoFile = formData.get('logo') as File;
        if (logoFile && logoFile.size > 0) {
            const fileExtension = path.extname(logoFile.name);
            const nombreArchivo = `logo${fileExtension}`;
            const logoUploadDir = path.join(process.cwd(), 'element', 'imgs', user.empresaId);
            const fullPath = path.join(logoUploadDir, nombreArchivo);

            await mkdir(logoUploadDir, { recursive: true });

            const buffer = Buffer.from(await logoFile.arrayBuffer());
            await writeFile(fullPath, buffer);
            
            updateData.srcLogo = `/element/imgs/${user.empresaId}/${nombreArchivo}`;
        }

        const [updatedEmpresa] = await db
            .update(empresas)
            .set(updateData)
            .where(eq(empresas.id, user.empresaId))
            .returning();

        if (!updatedEmpresa) {
            return createResponse(404, 'Empresa no encontrada al actualizar');
        }

        return createResponse(200, 'Empresa actualizada correctamente', updatedEmpresa);

    } catch (error) {
        console.error('Error al actualizar la empresa:', error);
        return createResponse(500, 'Error interno del servidor', error);
    }
};
