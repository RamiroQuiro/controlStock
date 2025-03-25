import { eq } from "drizzle-orm";
import db from "../db";
import { comprasProveedores, proveedores } from "../db/schema";

export class ComprasServices {

     traerComprasUser=async (userId:string)=>{
        try {
            const comprasData = await db
              .select({
                id: comprasProveedores.id,
                nComprobante:comprasProveedores.nComprobante,
                fecha: comprasProveedores.fecha,
                total: comprasProveedores.total,
                proveedor:proveedores.nombre,
                metodoPago:comprasProveedores.metodoPago,
                dniProveedor:proveedores.dni
              })
              .from(comprasProveedores)
              .innerJoin(proveedores,eq(proveedores.id,comprasProveedores.proveedorId))
              .where(eq(comprasProveedores.userId, userId));
            return comprasData;
          } catch (error) {
            console.log(error);
        }

        }
        
        
}