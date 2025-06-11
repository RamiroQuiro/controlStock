import type { APIContext, APIRoute } from "astro";
import db from "../../../db";
import { eq } from "drizzle-orm";
import { traerVentasUser } from "../../../services/ventastodas.service";

export const GET:APIRoute=async ({request}) => {
    const userId=request.headers.get('xx-user-id')
    const empresaId=request.headers.get('xx-empresa-id')
    console.log('empresaId->',empresaId)
    try {
       const traerVentaUser=await traerVentasUser(empresaId)
       console.log('ventas ->',traerVentaUser)
        return new Response(JSON.stringify({
            msg:'datos enviados',
            data:traerVentaUser,
            status:200
        }));
      } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({
            msg:'error al buscar clientes',
            status:400
        }));
      }
}