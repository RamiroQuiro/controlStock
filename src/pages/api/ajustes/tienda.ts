import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import db from "../../../db";
import { empresaConfigTienda } from "../../../db/schema";
import { createResponse } from "../../../types";

// GET: Obtener configuración de tienda
export const GET: APIRoute = async ({ request, locals }) => {
  const { user } = locals;

  if (!user || !user.empresaId) {
    return createResponse(401, "No autorizado");
  }

  try {
    const config = await db
      .select()
      .from(empresaConfigTienda)
      .where(eq(empresaConfigTienda.empresaId, user.empresaId))
      .limit(1);

    if (config.length === 0) {
      // Si no existe configuración, crear una por defecto
      const [newConfig] = await db
        .insert(empresaConfigTienda)
        .values({
          empresaId: user.empresaId,
          theme: "clasica",
          colores: JSON.stringify({ primary: "#000000", secondary: "#ffffff" }),
          textos: JSON.stringify({ nombreTienda: "", descripcion: "" }),
          activo: true,
        })
        .returning();

      return createResponse(200, "Configuración creada", newConfig);
    }

    return createResponse(200, "Configuración obtenida", config[0]);
  } catch (error) {
    console.error("Error al obtener configuración de tienda:", error);
    return createResponse(500, "Error interno del servidor", error);
  }
};

// PUT: Actualizar configuración de tienda
export const PUT: APIRoute = async ({ request, locals }) => {
  const { user } = locals;

  if (!user || !user.empresaId) {
    return createResponse(401, "No autorizado");
  }

  try {
    const contentType = request.headers.get("content-type");
    let theme, colores, textos, imagenes, activo;
    let imagenHeroFile = null;

    // Detectar si es FormData (con archivo) o JSON
    if (contentType?.includes("multipart/form-data")) {
      // Manejar FormData con archivo
      const formData = await request.formData();

      theme = formData.get("theme") as string;
      colores = formData.get("colores")
        ? JSON.parse(formData.get("colores") as string)
        : null;
      textos = formData.get("textos")
        ? JSON.parse(formData.get("textos") as string)
        : null;
      activo = formData.get("activo") === "true";
      imagenHeroFile = formData.get("imagenHero") as File;

      // Si hay archivo, guardarlo
      if (imagenHeroFile && imagenHeroFile.size > 0) {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");

        // Crear directorio si no existe
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "tiendas",
          user.empresaId
        );
        await fs.mkdir(uploadDir, { recursive: true });

        // Generar nombre único para el archivo
        const ext = imagenHeroFile.name.split(".").pop();
        const filename = `hero-${Date.now()}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Guardar archivo
        const buffer = Buffer.from(await imagenHeroFile.arrayBuffer());
        await fs.writeFile(filepath, buffer);

        // URL relativa para la base de datos
        const imageUrl = `/uploads/tiendas/${user.empresaId}/${filename}`;

        // Actualizar objeto imagenes
        imagenes = {
          hero: imageUrl,
        };
      }
    } else {
      // Manejar JSON tradicional
      const body = await request.json();
      theme = body.theme;
      colores = body.colores;
      textos = body.textos;
      imagenes = body.imagenes;
      activo = body.activo;
    }

    // Verificar si existe configuración
    const existing = await db
      .select()
      .from(empresaConfigTienda)
      .where(eq(empresaConfigTienda.empresaId, user.empresaId))
      .limit(1);

    let result;

    if (existing.length === 0) {
      // Crear nueva configuración
      [result] = await db
        .insert(empresaConfigTienda)
        .values({
          empresaId: user.empresaId,
          theme: theme || "clasica",
          colores: colores ? JSON.stringify(colores) : null,
          textos: textos ? JSON.stringify(textos) : null,
          imagenes: imagenes ? JSON.stringify(imagenes) : null,
          activo: activo !== undefined ? activo : true,
        })
        .returning();
    } else {
      // Actualizar configuración existente
      const updateData: any = {};

      if (theme) updateData.theme = theme;
      if (colores) updateData.colores = JSON.stringify(colores);
      if (textos) updateData.textos = JSON.stringify(textos);

      // Si hay nuevas imágenes, combinar con las existentes
      if (imagenes) {
        const existingImages = existing[0].imagenes
          ? JSON.parse(existing[0].imagenes as string)
          : {};
        updateData.imagenes = JSON.stringify({
          ...existingImages,
          ...imagenes,
        });
      }

      if (activo !== undefined) updateData.activo = activo;

      [result] = await db
        .update(empresaConfigTienda)
        .set(updateData)
        .where(eq(empresaConfigTienda.empresaId, user.empresaId))
        .returning();
    }

    return createResponse(
      200,
      "Configuración actualizada correctamente",
      result
    );
  } catch (error) {
    console.error("Error al actualizar configuración de tienda:", error);
    return createResponse(500, "Error interno del servidor", error);
  }
};
