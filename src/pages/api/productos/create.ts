import type { APIContext } from "astro";
import db from "../../../db";
import { nanoid } from "nanoid";
import { movimientosStock, productos, stockActual } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";
import path from "path";
import { promises as fs } from "fs";
import sharp from "sharp";
import { cache } from "../../../utils/cache";
import type { Producto } from "../../../types";
import { productoCategorias } from "../../../db/schema/productoCategorias";
import { generateId } from "lucia";
import { getFechaUnix } from "../../../utils/timeUtils";
import { normalizadorUUID } from "../../../utils/normalizadorUUID";
import {
  empresas,
  users,
  depositos,
  ubicaciones,
  categorias,
} from "../../../db/schema";
function cleanId(id: any): string | null {
  if (id === null || id === undefined) return null;
  const s = String(id).trim();
  return s === "" ? null : s;
}

export async function POST({ request, locals }: APIContext): Promise<Response> {
  try {
    const data = await request.formData();
    const { user } = locals;

    console.log("VARIABLES LOCALS   ->", locals);
    // Validar usuario autenticado
    if (!user?.id) {
      return new Response(
        JSON.stringify({
          status: 401,
          msg: "Usuario no autenticado",
        }),
        { status: 401 },
      );
    }

    // Obtener IDs (fallbac a sesion si no vienen en el form)
    const empresaId = data.get("empresaId")?.toString() || user.empresaId || "";
    const userId = data.get("userId")?.toString() || user.id || "";

    // Validar campos requeridos
    const requiredFields = ["codigoBarra", "nombre", "descripcion"];

    const missingFields = requiredFields.filter((field) => !data.get(field));

    // Validar empresaId específicamente (es crítico)
    if (!empresaId) missingFields.push("empresaId");

    if (missingFields.length > 0) {
      console.error("Campos requeridos faltantes:", missingFields);
      return new Response(
        JSON.stringify({
          status: 400,
          msg: `Campos requeridos faltantes: ${missingFields.join(", ")}`,
        }),
        { status: 400 },
      );
    }

    // Extraer y validar datos
    const productoData = {
      nombre: data.get("nombre")?.toString() || "",
      userId: userId,
      descripcion: data.get("descripcion")?.toString() || "",
      precio: parseFloat(data.get("precio")?.toString() || "0"),
      stock: parseInt(data.get("stock")?.toString() || "0"),
      pVenta: Number(data.get("pVenta") || 0),
      pCompra: Number(data.get("pCompra") || 0),
      categoriasIds: data.get("categoriasIds")?.toString() || "[]",
      deposito: data.get("deposito")?.toString() || "",
      impuesto: data.get("impuesto")?.toString() || "21%",
      empresaId: empresaId,
      creadoPor: user.id, // Usar el usuario autenticado, no el del form
      iva: Number(data.get("iva") || 21),
      descuento: Number(data.get("descuento") || 0),
      modelo: data.get("modelo")?.toString() || "",
      ubicacionId: cleanId(data.get("ubicacionId")),
      depositoId: cleanId(data.get("depositoId")),
      marca: data.get("marca")?.toString() || "",
      localizacion: data.get("localizacion")?.toString() || "",
      alertaStock: Number(data.get("alertaStock") || 0),
      codigoBarra: data.get("codigoBarra")?.toString() || "",
    };

    // 1. Validar que la empresa existe
    const [empresaExists] = await db
      .select({ id: empresas.id })
      .from(empresas)
      .where(eq(empresas.id, productoData.empresaId));

    if (!empresaExists) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: `La empresa con ID ${productoData.empresaId} no existe`,
        }),
        { status: 400 },
      );
    }

    // 2. Validar que el usuario creador existe
    const [userExists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, productoData.creadoPor));

    if (!userExists) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: `El usuario con ID ${productoData.creadoPor} no existe`,
        }),
        { status: 400 },
      );
    }

    // 3. Validar ubicacionId si se proporcionó
    if (productoData.ubicacionId) {
      const [ubicacionExists] = await db
        .select({ id: ubicaciones.id })
        .from(ubicaciones)
        .where(eq(ubicaciones.id, productoData.ubicacionId));

      if (!ubicacionExists) {
        return new Response(
          JSON.stringify({
            status: 400,
            msg: `La ubicación con ID ${productoData.ubicacionId} no existe`,
          }),
          { status: 400 },
        );
      }
    }

    // 4. Validar depositoId si se proporcionó
    if (productoData.depositoId) {
      const [depositoExists] = await db
        .select({ id: depositos.id })
        .from(depositos)
        .where(eq(depositos.id, productoData.depositoId));

      if (!depositoExists) {
        return new Response(
          JSON.stringify({
            status: 400,
            msg: `El depósito con ID ${productoData.depositoId} no existe`,
          }),
          { status: 400 },
        );
      }
    }

    // Resto de tu código (procesamiento de imagen, validación de plan, etc.)
    // ...
    // Parsear categoriasIds
    let categoriasIds = [];
    try {
      categoriasIds = JSON.parse(productoData.categoriasIds);
      if (!Array.isArray(categoriasIds)) {
        categoriasIds = [];
      }
    } catch (e) {
      console.error("Error al parsear categoriasIds:", e);
      categoriasIds = [];
    }

    // Validar que las categorías existen (opcional pero recomendado)
    for (const cat of categoriasIds) {
      const catId = typeof cat === "object" && cat !== null ? cat.id : cat;
      const cleanedCatId = cleanId(catId);
      if (cleanedCatId) {
        const [categoriaExists] = await db
          .select({ id: categorias.id })
          .from(categorias)
          .where(eq(categorias.id, cleanedCatId));

        if (!categoriaExists) {
          return new Response(
            JSON.stringify({
              status: 400,
              msg: `La categoría con ID ${cleanedCatId} no existe`,
            }),
            { status: 400 },
          );
        }
      }
    }

    // Procesar imagen (tu código existente)
    // ...

    // Verificar límites del plan (tu código existente)
    // ...

    // Crear producto en la base de datos
    const creacionProducto = await db.transaction(async (trx) => {
      const id = normalizadorUUID("prod-", 15);
      const fechaHoy = new Date();

      // Incrementar contador en Empresa
      await trx
        .update(empresas)
        .set({
          cantidadProductos: sql`${empresas.cantidadProductos} + 1`,
        })
        .where(eq(empresas.id, productoData.empresaId));

      // Insertar producto - Asegurar que todos los IDs existen
      const [insertedProduct] = await trx
        .insert(productos)
        .values({
          id,
          nombre: productoData.nombre,
          created_at: fechaHoy,
          descripcion: productoData.descripcion,
          creadoPor: productoData.creadoPor, // Ya validado
          iva: productoData.iva,
          pCompra: productoData.pCompra,
          pVenta: productoData.pVenta,
          codigoBarra: productoData.codigoBarra,
          alertaStock: productoData.alertaStock,
          modelo: productoData.modelo,
          descuento: productoData.descuento,
          empresaId: productoData.empresaId, // Ya validado
          impuesto: productoData.impuesto,
          marca: productoData.marca,
        })
        .returning();

      // Insertar relaciones con categorías (solo las que existen)
      if (categoriasIds && categoriasIds.length > 0) {
        for (const cat of categoriasIds) {
          const catId = typeof cat === "object" && cat !== null ? cat.id : cat;
          const cleanedCatId = cleanId(catId);

          if (cleanedCatId) {
            // Verificar nuevamente que la categoría existe (por si acaso)
            const [catExists] = await trx
              .select({ id: categorias.id })
              .from(categorias)
              .where(eq(categorias.id, cleanedCatId));

            if (catExists) {
              await trx.insert(productoCategorias).values({
                id: generateId(10),
                productoId: id,
                categoriaId: cleanedCatId,
              });
            } else {
              console.warn(
                `Categoría ${cleanedCatId} no encontrada, omitiendo relación`,
              );
            }
          }
        }
      }

      // Insertar stock actual (solo si depositoId y ubicacionId existen/válidos)
      const stockValues: any = {
        id: normalizadorUUID("stock", 15),
        productoId: id,
        cantidad: productoData.stock,
        alertaStock: productoData.alertaStock,
        createdAt: fechaHoy,
        userUltimaReposicion: productoData.creadoPor,
        empresaId: productoData.empresaId,
      };

      // Solo agregar si no son null/undefined
      if (productoData.ubicacionId)
        stockValues.ubicacionesId = productoData.ubicacionId;
      if (productoData.depositoId)
        stockValues.depositosId = productoData.depositoId;

      await trx.insert(stockActual).values(stockValues);

      // Registrar movimiento de stock
      await trx.insert(movimientosStock).values({
        id: normalizadorUUID("movStock", 15),
        productoId: id,
        cantidad: productoData.stock,
        userId: productoData.creadoPor,
        empresaId: productoData.empresaId,
        fecha: fechaHoy,
        tipo: "ingreso",
        motivo: "StockInicial",
      });

      return insertedProduct;
    });

    // Invalidar caché
    await cache.invalidate(`stock_data_${productoData.empresaId}`);
    if (productoData.empresaId) {
      await cache.invalidate(`empresa_productos_${productoData.empresaId}`);
    }

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Producto creado correctamente",
        data: creacionProducto,
      }),
    );
  } catch (error: any) {
    console.error("Error general:", error);

    // Mejor manejo de errores de foreign key
    if (
      error.message?.includes("FOREIGN KEY") ||
      error.code === "SQLITE_CONSTRAINT"
    ) {
      // Intentar extraer qué foreign key falló
      const fkMatch = error.message?.match(
        /FOREIGN KEY constraint failed\s+-\s+(\w+)/i,
      );
      return new Response(
        JSON.stringify({
          status: 409,
          msg: "Error de integridad referencial. Verifica que todos los IDs referenciados existan.",
          detail: fkMatch ? `Tabla: ${fkMatch[1]}` : error.message,
        }),
        { status: 409 },
      );
    }

    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error interno del servidor",
        error: error.message || "Error desconocido",
      }),
      { status: 500 },
    );
  }
}
