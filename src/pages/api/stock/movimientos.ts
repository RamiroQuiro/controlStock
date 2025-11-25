import type { APIRoute } from "astro";
import db from "../../../db";
import { movimientosStock, productos, users } from "../../../db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { lucia } from "../../../lib/auth";

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  // Filtros opcionales
  const fechaDesde = url.searchParams.get("fechaDesde");
  const fechaHasta = url.searchParams.get("fechaHasta");

  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response("No autorizado", { status: 401 });
  }
  const { user } = locals;
  const { session } = await lucia.validateSession(sessionId);
  if (!session) {
    return new Response("No autorizado", { status: 401 });
  }

  try {
    // Construir condiciones de filtro
    const conditions = [eq(movimientosStock.empresaId, user.empresaId)];

    if (fechaDesde) {
      conditions.push(gte(movimientosStock.fecha, new Date(fechaDesde)));
    }
    if (fechaHasta) {
      // Ajustar fechaHasta al final del día
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      conditions.push(lte(movimientosStock.fecha, hasta));
    }

    // Consulta principal
    const movimientos = await db
      .select({
        id: movimientosStock.id,
        fecha: movimientosStock.fecha,
        tipo: movimientosStock.tipo, // 'ingreso', 'egreso', 'ajuste'
        cantidad: movimientosStock.cantidad,
        motivo: movimientosStock.motivo,
        observacion: movimientosStock.observacion,
        productoNombre: productos.nombre,
        productoCodigo: productos.codigoBarra,
        usuarioNombre: users.name,
      })
      .from(movimientosStock)
      .leftJoin(productos, eq(movimientosStock.productoId, productos.id))
      .leftJoin(users, eq(movimientosStock.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(movimientosStock.fecha))
      .limit(limit)
      .offset(offset);

    // Contar total para paginación
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(movimientosStock)
      .where(and(...conditions));

    return new Response(
      JSON.stringify({
        status: 200,
        data: movimientos,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error al obtener el historial de movimientos",
      })
    );
  }
};
