import type { APIRoute } from 'astro';
import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import db from '../../../db';
import { clientes } from '../../../db/schema';

// Definimos el tipo para las filas del CSV de clientes
interface ClienteCSV {
  nombre: string;
  email?: string;
  dni?: string;
  telefono?: string;
  direccion?: string;
  cuit?: string;
  observaciones?: string;
  condicionIva?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const { user } = locals;
  const empresaId = user?.empresaId;
  const userId = user?.id;

  if (!empresaId || !userId) {
    return new Response('No autorizado', { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file-clientes') as File;

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
    Papa.parse<ClienteCSV>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (const [index, row] of results.data.entries()) {
          const fila = index + 2; // +2 por encabezado y base 0
          const nombreCliente = row.nombre || 'Cliente Desconocido';

          if (!row.nombre) {
            resultadosDetallados.push({
              fila,
              nombre: nombreCliente,
              estado: 'Error',
              mensaje: 'El campo nombre es obligatorio.',
            });
            continue;
          }

          try {
            const clienteParaInsertar = {
              id: nanoid(),
              nombre: row.nombre,
              email: row.email,
              telefono: row.telefono,
              direccion: row.direccion,
              dni: row.dni || null,
              cuit: row.cuit || null,
              observaciones: row.observaciones || '',
              condicionIva: row.condicionIva || '',
              empresaId: empresaId,
              creadoPor: userId,
            };

            // DEBUG: Mostrar el objeto que se va a insertar
            console.log('Objeto a Insertar en BD:', clienteParaInsertar);

            await db.insert(clientes).values(clienteParaInsertar);

            resultadosDetallados.push({
              fila,
              nombre: nombreCliente,
              estado: 'Éxito',
              mensaje: 'Cliente importado correctamente.',
            });
          } catch (error) {
            resultadosDetallados.push({
              fila,
              nombre: nombreCliente,
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
