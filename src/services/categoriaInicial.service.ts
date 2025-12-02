import { generateId } from "lucia";
import db from "../db";
import { categorias } from "../db/schema";
import { normalizadorUUID } from "../utils/normalizadorUUID";

export const inciarCategoria = async (empresaId: string, userId: string) => {
  try {
    await db.insert(categorias).values({
      id: normalizadorUUID(`categoria-${empresaId}`, 10),
      nombre: "general",
      descripcion: "categoria general defecto",
      creadoPor: userId,
      color: "bg-primary-100",
      empresaId,
      activo: 1,
    });
  } catch (error) {
    const errorData = error as Error;
    console.error("Error al inicializar categoria:", errorData.message);
    throw errorData;
  }
};
