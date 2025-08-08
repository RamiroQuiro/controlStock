import type { APIRoute } from 'astro';
import Papa from 'papaparse';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file-productos') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ message: 'No se ha subido ningún archivo.' }),
        { status: 400 }
      );
    }

    const fileContent = await file.text();

    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Por ahora, solo devolvemos los datos parseados para verificar
          resolve(new Response(JSON.stringify(results.data), { status: 200 }));
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          reject(
            new Response(JSON.stringify({ message: 'Error al procesar el archivo CSV.' }), {
              status: 500,
            })
          );
        },
      });
    });

  } catch (error) {
    console.error('Error en el endpoint de importación:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor.' }),
      { status: 500 }
    );
  }
};
