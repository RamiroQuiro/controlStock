import type { APIContext } from "astro";
import db from "../../../db";
import { productos } from "../../../db/schema";
import { eq } from "drizzle-orm";
import path from "path";
import { promises as fs } from "fs";
import sharp from "sharp";
import { nanoid } from "nanoid";
import { cache } from "../../../utils/cache";

export async function POST({ request, locals }: APIContext): Promise<Response> {
  const { user } = locals;
  if (!user) {
    return new Response(JSON.stringify({ msg: "No autorizado" }), {
      status: 401,
    });
  }

  try {
    const data = await request.formData();
    const productoId = data.get("productoId")?.toString();
    const fotoProducto = data.get("fotoProducto") as File;
    const empresaId = user.empresaId;

    if (!productoId || !fotoProducto) {
      return new Response(
        JSON.stringify({
          msg: "Faltan datos requeridos (productoId, fotoProducto)",
        }),
        { status: 400 }
      );
    }

    // Validar imagen
    if (!(fotoProducto instanceof File) || fotoProducto.size === 0) {
      return new Response(
        JSON.stringify({ msg: "Archivo de imagen inválido" }),
        { status: 400 }
      );
    }

    // Directorio de guardado
    const userDir = path.join(
      process.cwd(),
      "element",
      "imgs",
      empresaId,
      "productos"
    );

    try {
      await fs.access(userDir);
    } catch (e) {
      await fs.mkdir(userDir, { recursive: true });
    }

    // Procesar imagen
    const imageId = nanoid(10);
    const extension = path.extname(fotoProducto.name);
    const nombreArchivo = `${imageId}${extension}`;
    const rutaGuardado = path.join(userDir, nombreArchivo);
    const rutaRelativa = `/element/imgs/${empresaId}/productos/${nombreArchivo}`;

    try {
      const buffer = await fotoProducto.arrayBuffer();
      await sharp(Buffer.from(buffer))
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toFile(rutaGuardado);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      return new Response(
        JSON.stringify({ msg: "Error al procesar la imagen" }),
        { status: 500 }
      );
    }

    // Obtener producto actual para borrar imagen anterior (opcional)
    const [productoActual] = await db
      .select()
      .from(productos)
      .where(eq(productos.id, productoId));

    if (
      productoActual?.srcPhoto &&
      !productoActual.srcPhoto.includes("default")
    ) {
      try {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          productoActual.srcPhoto.replace(/^\//, "")
        );
        // await fs.unlink(oldImagePath); // Descomentar si queremos borrar la anterior
      } catch (e) {
        console.warn("No se pudo borrar la imagen anterior:", e);
      }
    }

    // Actualizar BD
    await db
      .update(productos)
      .set({ srcPhoto: rutaRelativa })
      .where(eq(productos.id, productoId));

    // Invalidar caché
    await cache.invalidate(`stock_data_${empresaId}`);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Imagen actualizada correctamente",
        srcPhoto: rutaRelativa,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar imagen:", error);
    return new Response(
      JSON.stringify({
        msg: "Error interno del servidor",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
