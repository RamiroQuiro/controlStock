import { stadisticasDash } from './dashboard.service';
import 'dotenv/config'; // Carga las variables de entorno

// ¡Esta función ahora llama a la API real de Google Gemini!
const callAIModel = async (prompt: string) => {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('La GEMINI_API_KEY no está configurada en el archivo .env');
    return 'Error: La clave de API para el servicio de IA no está configurada. Por favor, contacta al administrador.';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error desde la API de Gemini:', errorBody);
      throw new Error(
        `La solicitud a la API falló con el estado ${response.status}`
      );
    }

    const data = await response.json();
    // Navegamos la estructura de la respuesta de Gemini para obtener el texto
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error llamando al modelo de IA:', error);
    return 'Error: No se pudo conectar con el servicio de IA. Verifica la clave de API y la conexión a internet.';
  }
};

class IaService {
  public async analizarVentasSemanales(empresaId: string): Promise<string> {
    try {
      // 1. Obtener los datos reales del dashboard
      const stats = await stadisticasDash('user-id-placeholder', empresaId); // El userId necesita ser manejado correctamente

      if (!stats || !stats.dataDb) {
        return 'No hay suficientes datos para generar un análisis.';
      }

      const {
        nVentasDelMes,
        clientesNuevosMes,
        productosBajoStock,
        categorias,
      } = stats.dataDb;

      // 2. Crear el prompt para la IA con datos reales
      const prompt = `
        Eres un asesor de negocios experto para un sistema de gestión de ventas e inventario. Analiza los siguientes datos del mes para el dueño de un negocio y genera un resumen ejecutivo en formato de TEXTO PLANO. Sé conciso, amigable y directo. El objetivo es darle al usuario una visión clara y accionable de su rendimiento.

        **Datos de Rendimiento del Mes:**
        - Número total de ventas realizadas: ${nVentasDelMes || 0}
        - Clientes nuevos adquiridos: ${clientesNuevosMes?.nClientesNuevos || 0}
        - Cantidad de productos con bajo stock (necesitan reposición): ${productosBajoStock?.cantidadBajoStock || 0}
        - Rendimiento de las categorías (JSON): ${JSON.stringify(categorias)}
        - Ticket promedio del mes: ${stats.dataDb.ticketPromedioMes || 0}
        - Rendimiento promedio del mes: ${stats.dataDb.rendimientoPromedio || 0}

        **Instrucciones para tu respuesta (TEXTO PLANO):**
        1.  Comienza con un saludo amigable.
        2.  Presenta los puntos clave como una lista de viñetas (usando "- ").
        3.  Resalta las cifras importantes usando asteriscos (ejemplo: *12,500*).
        4.  Si hay productos con bajo stock, menciónalo como una alerta crítica.
        5.  Basado en las categorías, identifica la de mejor rendimiento y la que podría necesitar más atención.
        6.  Termina con una recomendación o sugerencia proactiva.
        7.  NO USES HTML, solo texto plano con saltos de línea.
      `;

      // 3. Llamar al modelo de IA con el prompt
      const analisis = await callAIModel(prompt);

      return analisis;
    } catch (error) {
      console.error('Error en el servicio de IA:', error);
      throw new Error('No se pudo generar el análisis de IA.');
    }
  }
}

export const iaService = new IaService();
