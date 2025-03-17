import { eq } from "drizzle-orm";
import db from "../db";
import { ventas } from "../db/schema";

export const traerVentasUser = async (userId: string) => {
  try {
    const ventasData = await db
      .select()
      .from(ventas)
      .where(eq(ventas.userId, userId));
    return ventasData;
  } catch (error) {
    console.log(error);
  }
};
