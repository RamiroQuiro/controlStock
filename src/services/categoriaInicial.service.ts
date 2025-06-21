import { generateId } from "lucia"
import db from "../db"
import { categorias } from "../db/schema"

export const inciarCategoria = async (empresaId:string, userId:string) => {
    try {
        await db.insert(categorias).values({
            id: generateId(13),
            nombre: "general",
            descripcion: "categoria general defecto",
            creadoPor: userId,
            empresaId,
            activo: 1,
        })
    } catch (error) {
        const errorData = error as Error;
        console.error("Error al inicializar categoria:", errorData.message);
        throw errorData;
    }
}
