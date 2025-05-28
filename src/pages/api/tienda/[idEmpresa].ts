import type { APIContext } from "astro";
import db from "../../../db";
import { empresaConfigTienda, empresas, productos } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const GET = async ({ params }: APIContext) => {
  const { idEmpresa } = params;

  try {
    // 1. Obtener datos de la empresa
    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, idEmpresa));

    if (!empresa) {
      return new Response(JSON.stringify({ msg: "Empresa no encontrada" }), { status: 404 });
    }
    const [configuracionTienda]=await db.select().from(empresaConfigTienda).where(eq(empresaConfigTienda.empresaId,idEmpresa));
    console.log(configuracionTienda)
    // 2. Obtener productos Ecommerce de la empresa
    const productosEcommerce = await db
      .select()
      .from(productos)
      .where(
        eq(productos.empresaId, idEmpresa) &&
        eq(productos.isEcommerce, true)
      );

    

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
      productos: productosEcommerce,
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