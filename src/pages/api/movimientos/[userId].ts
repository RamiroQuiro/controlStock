import type { APIContext } from "astro";
import db from "../../../db";
import { nanoid } from "nanoid";
import { stockActual, productos, movimientosStock } from "../../../db/schema";

export async function POST({ request, params }: APIContext): Promise<Response> {
  const { userId } = params;
  const body = await request.json();
  console.log(body)
  // fatla autenticacion con lucia auth

  try {
    const id = nanoid(13);
    const insertarData = await db.insert(movimientosStock).values({
      id,
      userId,
      ...body,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Movimiento registrado con éxito",
      })
    );
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
