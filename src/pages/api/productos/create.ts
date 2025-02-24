import type { APIContext, APIRoute } from "astro";
import db from "../../../db";
import { nanoid } from "nanoid";
import { movimientosStock, productos, stockActual } from "../../../db/schema";
import { sql } from "drizzle-orm";
import path from "path";
import { promises as fs } from "fs";
import sharp from "sharp";

export async function POST({ request, params }: APIContext): Promise<Response> {
  const data = await request.formData();
  const nombre = data.get("nombre")?.toString() || "";
  const userId = data.get("userId")?.toString() || "";
  const descripcion = data.get("descripcion")?.toString() || "";
  const precio = parseFloat(data.get("precio")?.toString() || "0");
  const stock = parseInt(data.get("stock")?.toString() || "0");
  const pVenta = data.get("pVenta");
  const pCompra = data.get("pCompra");
  const categoria = data.get("categoria");
  const deposito=data.get('deposito')
  const impuesto=data.get('impuesto')
  const descuento=data.get('descuento')
  const modelo = data.get("modelo");
  const marca = data.get("marca");
  const localizacion = data.get("pCompra");
  const cantidadAlerta = parseInt(
    data.get("cantidadAlerta")?.toString() || "0"
  );
  const codigoBarra = data.get("codigoBarra")?.toString() || "";
  const fotoProducto = data.get("fotoProducto") as File;

console.log('deposito ->',deposito)

  const userDir = path.join(
    process.cwd(),
    "element",
    "imgs",
    userId,
    "productos"
  );

  if (!fotoProducto || !(fotoProducto instanceof File)) {
    return new Response(
      JSON.stringify({ status: 400, msg: "Archivo de imagen no enviado" }),
      { status: 400 }
    );
  }
  // Debug: Mostrar información de la imagen
  // console.log(userId);

  try {
    if (
      !(await fs
        .access(userDir)
        .then(() => true)
        .catch(() => false))
    ) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: "Directorio de usuario no encontrado",
        }),
        { status: 400 }
      );
    }

    // Procesar la imagen
    const imageId = nanoid(10);
    const extension = path.extname(fotoProducto.name);
    const nombreArchivo = `${imageId}${extension}`;
    const rutaGuardado = path.join(userDir, nombreArchivo);

    // Procesar y guardar imagen
    const buffer = await fotoProducto.arrayBuffer();
    await sharp(Buffer.from(buffer))
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(rutaGuardado);
    const rutaRelativa = `/element/imgs/${userId}/productos/${nombreArchivo}`;
    // console.log("ruta userId", userId);
    const creacionProducto = await db.transaction(async (trx) => {
      const id = nanoid(10);
      const [insterProduct] = await trx
        .insert(productos)
        .values({
          id,
          nombre,
          descripcion,
          precio,
          pCompra,
          categoria,
          pVenta,
          codigoBarra,
          modelo,
          descuento,
          impuesto,
          marca,
          updatedAt: sql`(strftime('%s','now'))`,
          stock,
          userId,
          cantidadAlerta,
          srcPhoto: rutaRelativa,
        })
        .returning();

      await trx.insert(stockActual).values({
        id: nanoid(10),
        productoId: insterProduct.id,
        cantidad: stock,
        alertaStock: cantidadAlerta,
        localizacion,
        deposito,
        updatedAt: sql`(strftime('%s','now'))`,
      });

      await trx.insert(movimientosStock).values({
        id: nanoid(10),
        productoId: insterProduct.id,
        cantidad: stock,
        userId,
        clienteId: null,
        proveedorId: null,
        fecha: sql`(strftime('%s','now'))`,
        tipo: "ingreso",
        motivo: "StockInicial",
      });
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "producto creado correctamente",
        data: "insterProduct",
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
