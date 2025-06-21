import type { APIContext } from "astro";
import db from "../../../db";
import {
  categorias,
  empresaConfigTienda,
  empresas,
  productos,
} from "../../../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { productoCategorias } from "../../../db/schema/productoCategorias";

export const GET = async ({ params }: APIContext) => {
  const { idEmpresa } = params;

  try {
    // 1. Obtener datos de la empresa
    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, idEmpresa));

    if (!empresa) {
      return new Response(JSON.stringify({ msg: "Empresa no encontrada" }), {
        status: 404,
      });
    }
    const [configuracionTienda] = await db
      .select()
      .from(empresaConfigTienda)
      .where(eq(empresaConfigTienda.empresaId, idEmpresa));
    console.log(configuracionTienda);
    // 2. Obtener productos Ecommerce de la empresa
    const productosEcommerce = await db
      .select()
      .from(productos)
      .where(
        and(eq(productos.empresaId, idEmpresa), eq(productos.isEcommerce, true))
      )
      .limit(20);

    const categoriaDeProducto = await db
      .select({
        productoId: productoCategorias.productoId,
        categoriaId: productoCategorias.categoriaId,
        nombre: categorias.nombre,
      })
      .from(productoCategorias)
      .innerJoin(categorias, eq(productoCategorias.categoriaId, categorias.id))
      .where(
        inArray(
          productoCategorias.productoId,
          productosEcommerce.map((p) => p.id)
        )
      );

    const productosConCategorias = productosEcommerce.map((prod) => {
      const categoriasProd = categoriaDeProducto.filter(
        (cat) => cat.productoId === prod.id
      );
      return {
        ...prod,
        categorias: categoriasProd.map((cat) => ({
          id: cat.categoriaId,
          nombre: cat.nombre,
        })),
      };
    });
    const categoriasDB = await db
      .select()
      .from(categorias)
      .where(eq(categorias.empresaId, idEmpresa));

    // 4. Preparar respuesta
    const response = {
      empresa: {
        id: empresa.id,
        razonSocial: empresa.razonSocial,
        nombreFantasia: empresa.nombreFantasia,
        telefono: empresa.telefono,
        direccion: empresa.direccion,
        srcLogo: empresa.srcLogo, // url o base64
        srcPhoto: empresa.srcPhoto, // url o base64
        // agrega más campos si tienes
      },
      categorias: categoriasDB,
      productos: productosConCategorias,
      configuracionTienda: configuracionTienda,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ msg: "Error al obtener datos de la tienda", error }),
      { status: 500 }
    );
  }
};
