import type { APIContext, APIRoute } from "astro";
import db from "../../../db";
import { nanoid } from "nanoid";
import { productos, stockActual } from "../../../db/schema";
import { sql } from "drizzle-orm";

export async function POST({ request, params }: APIContext): Promise<Response> {
  const data = await request.formData();
  const nombre = data.get("nombre")?.toString() || "";
  const descripcion = data.get("descripcion")?.toString() || "";
  const precio = parseFloat(data.get("precio")?.toString() || "0");
  const stock = parseInt(data.get("stock")?.toString() || "0");
  const cantidadAlerta = parseInt(data.get("cantidadAlerta")?.toString() || "0");
  const codigoBarra = data.get("codigoBarra")?.toString() || "";
  const srcPhoto = data.get("srcPhoto") as File;
  console.log('endpoint data',srcPhoto)

  if (!srcPhoto || !(srcPhoto instanceof File)) {
    return new Response(
      JSON.stringify({ status: 400, msg: "Archivo de imagen no enviado" }),
      { status: 400 }
    );
  }
    // Debug: Mostrar información de la imagen
    console.log(`Recibida imagen: ${srcPhoto.name}, tamaño: ${srcPhoto.size}`);

  try {

    const creacionProducto=await db.transaction(async(trx)=>{
        const id = nanoid(10);
        const [insterProduct] = await trx.insert(productos).values({
            id,
            nombre,
            descripcion,
            precio,
            codigoBarra,
            updatedAt: sql`(strftime('%s','now'))`,
            stock,
            cantidadAlerta,
            srcPhoto,
          })
          .returning();

          await trx.insert(stockActual).values({
            id:nanoid(10),
            productoId:insterProduct.id,
            cantidad:data.stock,
            alertaStock:data.cantidadAlerta,
            localizacion:'deposito',
            updatedAt: sql`(strftime('%s','now'))`,
          })
    })
    
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "producto creado correctamente",
        data: 'insterProduct',
      })
    );
  } catch (error) {
    console.log(error);
    if (error.rawCode === 2067) {
      return new Response(
        JSON.stringify({
          status: 405,
          msg: "producto con codigo de barra existente",
        })
      );
    }
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "error al guardar el producto",
      })
    );
  }
}
