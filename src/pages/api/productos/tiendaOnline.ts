import type { APIContext } from "astro";
import { productos } from "../../../db/schema";
import { eq } from "drizzle-orm";
    import db from "../../../db";

export const POST:APIContext = async ({request,locals}) => {
    const {id,isEcommerce} = await request.json();
    const {user} = locals;
    console.log(id, user)
    
    try {   
        if(!user){
            return new Response(JSON.stringify({msg: 'Usuario no autorizado',error:'Usuario no autorizado'}), {status: 401})
        }
        const [productoActualizado] = await db
        .update(productos)
        .set({
            isEcommerce: isEcommerce
        })
        .where(eq(productos.id, id))
        .returning();
    
        return new Response(JSON.stringify({msg: 'Producto actualizado',data:productoActualizado,status:200}), {status: 200})
    } catch (error) {
        return new Response(JSON.stringify({msg: 'Error al actualizar producto',error:error,status:400}), {status: 400})
    }
}   

export const GET = async ({ locals }) => {
  try {
    const productosEcommerce = await db
      .select()
      .from(productos)
      .where(eq(productos.isEcommerce, true));
    return new Response(JSON.stringify(productosEcommerce), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ msg: 'Error al obtener productos', error }), { status: 500 });
  }
};