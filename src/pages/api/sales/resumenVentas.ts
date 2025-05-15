import type { APIRoute } from "astro";
import db from "../../../db";
import { ventas, detalleVentas } from "../../../db/schema";
import { and, eq, sql } from "drizzle-orm";

export const GET: APIRoute = async ({ request }) => {
  // Obtener userId y filtro de los headers. Si no hay filtro, usar añoActual por defecto
  const userId = request.headers.get("x-user-id");
  const empresaId = request.headers.get("xx-empresa-id");
  const filtroSelector = request.headers.get("filtro-selector") || "añoActual";

  // Validación de usuario
  if (!userId) {
    return new Response(
      JSON.stringify({
        msg: "Usuario no autorizado",
        status: 401,
      }),
      { status: 401 }
    );
  }

  try {
    // Configuración inicial de fechas
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();
    let condicionFecha;
    let meses = [];

    // Determinar el rango de fechas según el filtro seleccionado
    switch (filtroSelector) {
      case "mesActual":
        // Filtrar por el mes actual y agrupar por día
        condicionFecha = sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch')) = ${mesActual.toString().padStart(2, "0")} AND strftime('%Y', datetime(${ventas.fecha}, 'unixepoch')) = ${añoActual.toString()}`;
        
        // Generar array con los días del mes actual
        const diasEnMes = new Date(añoActual, mesActual, 0).getDate();
        meses = Array.from({ length: diasEnMes }, (_, i) => {
          const fecha = new Date(añoActual, mesActual - 1, i + 1);
          return fecha.getDate().toString(); // Retornamos solo el número del día
        });
        break;
      case "ultimos6Meses":
        // Calcular la fecha de hace 6 meses
        const fecha6Meses = new Date();
        fecha6Meses.setMonth(fecha6Meses.getMonth() - 5); // Cambiamos a -5 para incluir el mes actual
        const timestamp6Meses = Math.floor(fecha6Meses.getTime() / 1000);
        condicionFecha = sql`${ventas.fecha} >= ${timestamp6Meses}`;
        // Generar array con los nombres de los últimos 6 meses en orden correcto
        meses = Array.from({ length: 6 }, (_, i) => {
          const fecha = new Date();
          fecha.setMonth(fechaActual.getMonth() - 5 + i); // Ajustamos el cálculo para mantener el orden correcto
          return fecha.toLocaleString('es', { month: 'short' });
        });
        break;
      case "añoActual":
        // Filtrar todo el año actual
        condicionFecha = sql`strftime('%Y', datetime(${ventas.fecha}, 'unixepoch')) = ${añoActual.toString()}`;
        // Generar array con todos los meses hasta el actual
        meses = Array.from({ length: mesActual }, (_, i) => {
          const fecha = new Date(añoActual, i, 1);
          return fecha.toLocaleString('es', { month: 'short' });
        });
        break;
      default:
        condicionFecha = sql`strftime('%Y', datetime(${ventas.fecha}, 'unixepoch')) = ${añoActual.toString()}`;
        meses = Array.from({ length: mesActual }, (_, i) => {
          const fecha = new Date(añoActual, i, 1);
          return fecha.toLocaleString('es', { month: 'short' });
        });
    }

    // Consulta principal modificada para manejar días en caso de mesActual
    const ventasPorPeriodo = await db
      .select({
        periodo: filtroSelector === "mesActual" 
          ? sql`strftime('%d', datetime(${ventas.fecha}, 'unixepoch'))` 
          : sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch'))`,
        totalPeriodo: sql<number>`sum(${ventas.total})`,
        cantidadVentas: sql<number>`count(*)`,
      })
      .from(ventas)
      .where(and(eq(ventas.empresaId, empresaId), condicionFecha))
      .groupBy(filtroSelector === "mesActual" 
        ? sql`strftime('%d', datetime(${ventas.fecha}, 'unixepoch'))`
        : sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch'))`)
      .orderBy(filtroSelector === "mesActual"
        ? sql`strftime('%d', datetime(${ventas.fecha}, 'unixepoch'))`
        : sql`strftime('%m', datetime(${ventas.fecha}, 'unixepoch'))`);

    // Mapear los resultados
    const montosPorPeriodo = meses.map((_, index) => {
      let periodoNum;
      if (filtroSelector === "mesActual") {
        // Para mes actual, usamos el día (index + 1)
        periodoNum = (index + 1).toString().padStart(2, "0");
      } else if (filtroSelector === "ultimos6Meses") {
        // Lógica existente para últimos 6 meses
        const fecha = new Date();
        fecha.setMonth(fechaActual.getMonth() - 5 + index);
        periodoNum = (fecha.getMonth() + 1).toString().padStart(2, "0");
      } else {
        // Para otros filtros, usamos el índice + 1
        periodoNum = (index + 1).toString().padStart(2, "0");
      }
      const ventaPeriodo = ventasPorPeriodo.find(v => v.periodo === periodoNum);
      return ventaPeriodo ? ventaPeriodo.totalPeriodo : 0;
    });

    // Calcular totales según el período seleccionado
    const ventasTotales = montosPorPeriodo.reduce((acc, curr) => acc + curr, 0);
    const totalTransacciones = ventasPorPeriodo.reduce((acc, curr) => acc + curr.cantidadVentas, 0);
    const ticketPromedio = totalTransacciones > 0 ? ventasTotales / totalTransacciones : 0;

    return new Response(
      JSON.stringify({
        etiquetas: meses, // Cambiamos el nombre para que sea más genérico
        montosPorPeriodo, // Cambiamos el nombre para que sea más genérico
        ventasTotales,
        ticketPromedio,
        totalTransacciones,
        periodoActual: filtroSelector === "mesActual" ? "días" : "meses",
        msg: "Datos obtenidos correctamente",
        status: 200,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error al obtener datos:", error);
    return new Response(
      JSON.stringify({
        msg: "Error al obtener datos",
        status: 500,
      }),
      {
        status: 500,
      }
    );
  }
};