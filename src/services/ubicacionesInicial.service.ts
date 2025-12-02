import db from "../db";
import { generateId } from "lucia";
import { ubicaciones } from "../db/schema";
import { normalizadorUUID } from "../utils/normalizadorUUID";

export const ubicacionesInicial = async (empresaId: string, userId: string) => {
  try {
    const ubicacion = await db.insert(ubicaciones).values({
      id: normalizadorUUID(`ubicacion-${empresaId}`, 10),
      nombre: "ubicacion general",
      creadoPor: userId,
      empresaId,
      activo: true,
    });
    return ubicacion;
  } catch (error) {
    const errorData = error as Error;
    console.error("Error al inicializar ubicacion:", errorData.message);
    throw errorData;
  }
};
