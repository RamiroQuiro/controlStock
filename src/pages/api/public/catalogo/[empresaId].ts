import type { APIRoute } from "astro";
import { eq, and } from "drizzle-orm";
import db from "../../../../db";
import { empresas, categorias } from "../../../../db/schema";
import { getProductosFromDB } from "../../../../services/productos.db.service";

export const GET: APIRoute = async ({ params }) => {
  const { empresaId } = params;

  if (!empresaId) {
    return new Response(JSON.stringify({ msg: "Empresa ID requerido" }), {
      status: 400,
    });
  }

  try {
    // 1. Obtener datos de la empresa
    const [empresa] = await db
      .select({
        id: empresas.id,
        razonSocial: empresas.razonSocial,
        nombreFantasia: empresas.nombreFantasia,
        telefono: empresas.telefono,
        email: empresas.emailEmpresa,
        direccion: empresas.direccion,
        srcLogo: empresas.srcLogo,
        colorAsset: empresas.colorAsset,
        colorSecundario: empresas.colorSecundario,
        theme: empresas.theme, // 🆕 Importante para las plantillas
      })
      .from(empresas)
      .where(eq(empresas.id, empresaId));

    if (!empresa) {
      return new Response(JSON.stringify({ msg: "Empresa no encontrada" }), {
        status: 404,
      });
    }

    // 2. Obtener productos usando el servicio existente
    const productosRaw = await getProductosFromDB(empresaId);

    // Filtrar y mapear para el catálogo público
    const productosPublicos = productosRaw
      .filter((p) => p.activo) // Solo activos
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.pVenta,
        stock: p.stock?.cantidad || 0,
        srcImagen: p.srcPhoto, // Mapear srcPhoto a srcImagen
        categoria: p.categoria, // Usar el campo de texto categoria
        codigoBarra: p.codigoBarra,
      }));

    // 3. Obtener categorías activas
    const listaCategorias = await db
      .select({
        id: categorias.id,
        nombre: categorias.nombre,
        color: categorias.color,
      })
      .from(categorias)
      .where(
        and(eq(categorias.empresaId, empresaId), eq(categorias.activo, true))
      );

    return new Response(
      JSON.stringify({
        empresa,
        productos: productosPublicos,
        categorias: listaCategorias,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
    return new Response(JSON.stringify({ msg: "Error interno del servidor" }), {
      status: 500,
    });
  }
};
