import db from "../db";
import { generateId } from "lucia";
import { depositos } from "../db/schema";
import { normalizadorUUID } from "../utils/normalizadorUUID";

export const depositoInicial = async (empresaId: string, userId: string) => {
  try {
    const [deposito] = await db
      .insert(depositos)
      .values({
        id: normalizadorUUID(`deposito-${empresaId}`, 10),
        nombre: "Casa Central",
        creadoPor: userId,
        empresaId,
        activo: true,
      })
      .returning();
    return deposito;
  } catch (error) {
    const errorData = error as Error;
    console.error("Error al inicializar deposito:", errorData.message);
    throw errorData;
  }
};
