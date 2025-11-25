import db from "../db";
import { generateId } from "lucia";
import { depositos } from "../db/schema";

export const depositoInicial = async (empresaId: string, userId: string) => {
  try {
    const deposito = await db.insert(depositos).values({
      id: generateId(13),
      nombre: "Casa Central",
      creadoPor: userId,
      empresaId,
      activo: true,
    });
    return deposito;
  } catch (error) {
    const errorData = error as Error;
    console.error("Error al inicializar deposito:", errorData.message);
    throw errorData;
  }
};
