import type { APIContext } from "astro";
import db from "../../../db";

import { nanoid } from "nanoid";
import { eq, sql } from "drizzle-orm";
import { detallePresupuesto, presupuesto } from "../../../db/schema";
import type { Producto } from "../../../types";

export async function POST({ request, params }: APIContext): Promise<Response> {
  try {
    const {
      productos: productosSeleccionados,
      userId,
      data
    } = await request.json();
    
    // Validaciones previas
    if (!productosSeleccionados?.length || !userId || !data.clienteId) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: "Datos inválidos o incompletos",
        }),
        { status: 400 }
      );
    }

    if (data.total <= 0) {
      return new Response(
        JSON.stringify({
          status: 402,
          msg: "El monto total del presupuesto debe ser mayor a 0",
        }),
        { status: 402 }
      );
    }

    // Calcular fecha de expiración (5 días)
    const now = Date.now();
    const expira_at = now + (5 * 24 * 60 * 60 * 1000);

    const presupuestoDB = await db
      .transaction(async (trx) => {
        // Generar código único para el presupuesto
        const codigo = nanoid(8).toUpperCase();

        const presupuestoFinalizado = await trx
          .insert(presupuesto)
          .values({
            id: nanoid(),
            codigo,
            userId,
            expira_at,
            estado: 'activo',
            ...data
          })
          .returning();

        // Procesar cada producto del presupuesto
        await Promise.all(
          productosSeleccionados.map(async (prod) => {
            await trx.insert(detallePresupuesto).values({
              id: nanoid(),
              presupuestoId: presupuestoFinalizado[0].id,
              productoId: prod.id,
              cantidad: prod.cantidad,
              precioUnitario: prod.pVenta,
              subtotal: prod.cantidad * prod.pVenta,
              impuesto: prod.iva || 0,
              descuento: prod.descuento || 0
            });
          })
        );

        return presupuestoFinalizado[0];
      })
      .catch((error) => {
        console.error("Error en transacción:", error);
        throw error;
      });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Presupuesto generado con éxito",
        data:presupuestoDB
      })
    );

  } catch (error) {
    console.error("Error al generar presupuesto:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error al generar el presupuesto",
      }),
      { status: 500 }
    );
  }
}
