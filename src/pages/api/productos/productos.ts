import { like, or } from "drizzle-orm";
import { productos } from "../../../db/schema";
import db from "../../../db";

// Handler para el método GET del endpoint
export const GET: APIRoute = async ({ request, params }) => {
    // Extraer el `productoId` de los parámetros
    const url = new URL(request.url);
    const query=url.searchParams.get("search");
    console.log(query)
  
    // Validación inicial: comprobar si el `productoId` está presente
    if (!query) {
      return new Response(
        JSON.stringify({ error: "fatla el parametro de busqueda" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  

      // Inicia una transacción para manejar consultas relacionadas al producto
      try {
        const resultados = await db
          .select()
          .from(productos)
          .where(
            or(
              like(productos.codigoBarra, `%${query}%`),
              like(productos.descripcion, `%${query}%`),
              like(productos.categoria, `%${query}%`),
              like(productos.marca, `%${query}%`),
              like(productos.modelo, `%${query}%`),
            )
          )
          .limit(10); // 🔥 Solo traemos 10 resultados
    
        console.log(resultados);
      // Respuesta exitosa con los datos obtenidos
      return new Response(
        JSON.stringify({
          status: 200,
          data: resultados,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      // Manejo de errores durante la transacción o consultas
      console.error("Error al obtener los datos del producto:", error);
      return new Response(
        JSON.stringify({
          status: 400,
          msg: "Error al buscar los datos del producto",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
  