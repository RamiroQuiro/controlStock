import type { APIContext, APIRoute } from "astro";
import db from "../../../db";
import { desc, eq } from "drizzle-orm";
import { traerVentasEmpresa } from "../../../services/ventastodas.service";
import { clientes, empresas, presupuesto } from "../../../db/schema";

export const GET:APIRoute=async ({request}) => {
    const userId=request.headers.get('xx-user-id')
    const empresaId = request.headers.get("xx-empresa-id") || "";
    // console.log('empresaId->',empresaId)
    try {
     const presupuestos=await db.select({
      id: presupuesto.id,
      nComprobante: presupuesto.nComprobante,
      fecha: presupuesto.fecha,
      total: presupuesto.total,
      cliente: clientes.nombre,
      dniCliente: clientes.dni,
      direccionCliente: clientes.direccion,
      empresaId: presupuesto.empresaId,
      numeroFormateado:presupuesto.numeroFormateado,
      razonSocial: empresas.razonSocial,
      direccionEmpresa:empresas.direccion,
      documentoEmpresa:empresas.documento,
     }).from(presupuesto)
     .innerJoin(clientes,eq(clientes.id,presupuesto.clienteId))
     .innerJoin(empresas,eq(empresas.id,presupuesto.empresaId))
     .where(eq(presupuesto.empresaId,empresaId))
     .orderBy(desc(presupuesto.fecha))
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