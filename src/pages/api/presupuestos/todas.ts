import type { APIContext, APIRoute } from "astro";
import db from "../../../db";
import { eq } from "drizzle-orm";
import { traerVentasEmpresa } from "../../../services/ventastodas.service";
import { presupuesto } from "../../../db/schema";

export const GET:APIRoute=async ({request}) => {
    const userId=request.headers.get('xx-user-id')
    const empresaId = request.headers.get("xx-empresa-id") || "";
    console.log('empresaId->',empresaId)
    try {
     const presupuestos=await db.select().from(presupuesto).where(eq(presupuesto.empresaId,empresaId))
      //  console.log('ventas ->',traerVentaUser)
        return new Response(JSON.stringify({
            msg:'datos enviados',
            data:presupuestos,
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