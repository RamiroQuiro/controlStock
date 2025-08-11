import type { APIRoute } from 'astro';

import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import db from '../../../db';
import { proveedores } from '../../../db/schema';

interface ProveedorCSV {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  cuit?: string;
  celular?: string;
  dni?: string;
  observaciones?: string;
  condicionIva?: string;
  contacto?: string;
  domicilio?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  const empresaId = user?.empresaId;
  const userId = user?.id;

  if (!empresaId || !userId) {
    return new Response('No autorizado', { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file-proveedores') as File;

  if (!file) {
    return new Response('No se encontró el archivo', { status: 400 });
  }

  const fileContent = await file.text();

  const resultadosDetallados: {
    fila: number;
    nombre: string;
    estado: string;
    mensaje: string;
  }[] = [];

  return new Promise((resolve) => {
    Papa.parse<ProveedorCSV>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (const [index, row] of results.data.entries()) {
          const fila = index + 2;
          const nombreProveedor = row.nombre || 'Proveedor Desconocido';

          if (!row || !row.nombre) {
            resultadosDetallados.push({
              fila,
              nombre: nombreProveedor,
              estado: 'Error',
              mensaje: 'La fila está vacía o el campo nombre es obligatorio.',
            });
            continue;
          }

          try {
            const proveedorParaInsertar = {
              id: nanoid(),
              nombre: row.nombre,
              email: row.email || null,
              telefono: row.telefono || null,
              celular: row.celular || null,
              direccion: row.direccion || null,
              contacto: row.contacto || null,
              observaciones: row.observaciones || null,
              condicionIva: row.condicionIva || null,
              domicilio: row.domicilio || null,
              cuit: row.cuit ? Number(row.cuit) : null,
              dni: row.dni ? Number(row.dni) : null,
              empresaId: empresaId,
              creadoPor: userId,
            };

            // DEBUG: Mostrar el objeto que se va a insertar
            console.log('Objeto a Insertar en BD:', proveedorParaInsertar);

            await db.insert(proveedores).values(proveedorParaInsertar);

            resultadosDetallados.push({
              fila,
              nombre: nombreProveedor,
              estado: 'Éxito',
              mensaje: 'Proveedor importado correctamente.',
            });
          } catch (error) {
            resultadosDetallados.push({
              fila,
              nombre: nombreProveedor,
              estado: 'Error',
              mensaje:
                error instanceof Error
                  ? error.message
                  : 'Error en base de datos.',
            });
          }
        }

        resolve(
          new Response(JSON.stringify(resultadosDetallados), { status: 200 })
        );
      },
      error: (error) => {
        resolve(
          new Response(JSON.stringify({ message: error.message }), {
            status: 400,
          })
        );
      },
    });
  });
};
