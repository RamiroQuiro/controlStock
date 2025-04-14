import type { APIRoute } from "astro";
import { nanoid } from "nanoid";
import db from "../../../db";
import { clientes } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id"); // Asumiendo que tienes el userId en headers
    if (!body.nombre || !body.dni) {
      return new Response(
        JSON.stringify({
          message: "Nombre y DNI son requeridos",
        }),
        { status: 400 }
      );
    }

    const clienteExistente = (
      await db.select().from(clientes).where(and(eq(clientes.dni, body.dni),eq(clientes.userId,userId)))
    ).at(0);

    if (clienteExistente) {
      return new Response(
        JSON.stringify({
          msg: "Ya existe un cliente con ese DNI",
        }),
        { status: 400, statusText: "Ya existe un cliente con ese DNI" }
      );
    }

    const nuevoCliente = await db
      .insert(clientes)
      .values({
        id: nanoid(),
        userId,
        nombre: body.nombre,
        dni: Number(body.dni),
        telefono: body.telefono || null,
        email: body.email || null,
        direccion: body.direccion || null,
        categoria: body.categoria || "nuevo",
        limiteCredito: Number(body.limiteCredito) || 0,
        observaciones: body.observaciones || null,
        estado: "activo",
        fechaAlta: Math.floor(Date.now() / 1000), // Timestamp en segundos
      })
      .returning();

    return new Response(
      JSON.stringify({
        message: "Cliente creado exitosamente",
        data: nuevoCliente[0],
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return new Response(
      JSON.stringify({
        message: "Error interno del servidor",
      }),
      { status: 500 }
    );
  }
};
