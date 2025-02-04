import type { APIContext, APIRoute } from "astro";
import db from "../../../db";
import { nanoid } from "nanoid";
import { productos } from "../../../db/schema";

export async function POST({ request, params }: APIContext): Promise<Response> {
    const data=await request.json()
    console.log(data)
try {
    const id=nanoid(6)
    const insterProduct=await db.insert(productos).values({
        id,...data
    })
    return new Response(JSON.stringify({
        status:200,
        msg:'producto creado correctamente',
        data:insterProduct
    }))
} catch (error) {

    console.log(error)
    return new Response(JSON.stringify({
        status:400,
        msg:'error al guardar el producto',
        
    }))
}


}