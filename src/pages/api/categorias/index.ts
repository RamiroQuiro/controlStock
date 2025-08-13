import type { APIRoute } from 'astro';
import { and, eq, like, or, sql } from 'drizzle-orm';
import db from '../../../db';
import { categorias, productoCategorias } from '../../../db/schema';
import { generateId } from 'lucia';
import { createResponse } from '../../../types';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verificar autenticación primero
    if (!locals.user) {
      return createResponse(401, 'No autenticado');
    }

    const { nombre, descripcion, color } = await request.json();
    const empresaId = locals.user.empresaId;
    console.log('color', color);
    console.log('nombre', nombre);
    console.log('descripcion', descripcion);
    console.log('empresaId', empresaId);

    const nombreLowerCase = nombre.toLowerCase();

    const isCategoriaExistente = await db
      .select()
      .from(categorias)
      .where(
        and(
          eq(categorias.nombre, nombreLowerCase),
          eq(categorias.empresaId, empresaId)
        )
      )
      .limit(1);
    console.log('isCategoriaExistente', isCategoriaExistente);
    console.log('nombreLowerCase', nombreLowerCase);
    if (isCategoriaExistente.length > 0) {
      return createResponse(400, 'Categoria ya existe');
    }
    // Validar datos requeridos
    if (!nombre || !empresaId) {
      return createResponse(400, 'Nombre y empresaId son requeridos');
    }

    const categoria = await db
      .insert(categorias)
      .values({
        id: generateId(10),
        nombre: nombreLowerCase,
        descripcion,
        color: color,
        creadoPor: locals.user.id,
        empresaId,
      })
      .returning();

    return createResponse(200, 'Categoria agregada', categoria);
  } catch (error) {
    console.error('Error al agregar categoria:', error);
    return createResponse(500, 'Error al agregar categoria');
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('search')?.toLowerCase();
    // const empresaId = request.headers.get('xx-empresa-id');
    const { user } = locals;
    const isAll = url.searchParams.get('all');
    const empresaId = url.searchParams.get('empresaId');
    console.log('enpoint .>', isAll);
    if (!empresaId) {
      return createResponse(400, 'ID de empresa requerido');
    }

    let whereCondition = eq(categorias.empresaId, empresaId);

    if (isAll) {
      const categoriasConConteo = await db
        .select({
          id: categorias.id,
          nombre: categorias.nombre,
          descripcion: categorias.descripcion,
          color: categorias.color,
          activo: categorias.activo,
          creadoPor: categorias.creadoPor,
          created_at: categorias.created_at,
          cantidadProductos: sql`COUNT(${productoCategorias.productoId})`,
        })
        .from(categorias)
        .leftJoin(
          productoCategorias,
          eq(productoCategorias.categoriaId, categorias.id)
        )
        .where(eq(categorias.empresaId, user?.empresaId))
        .groupBy(categorias.id);

      return createResponse(200, 'Categorias encontradas', categoriasConConteo);
    }

    // Agregar condición de búsqueda solo si hay query
    if (query) {
      whereCondition = and(
        whereCondition,
        like(categorias.nombre, `%${query}%`)
      );
    }

    const categoriasDB = await db
      .select()
      .from(categorias)
      .where(whereCondition);

    if (categoriasDB.length === 0) {
      return createResponse(205, 'No se encontraron categorias', []);
    }

    return createResponse(200, 'Categorias encontradas', categoriasDB);
  } catch (error) {
    console.error('Error al buscar categorias:', error);
    return createResponse(500, 'Error al buscar categorias');
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const { id, nombre, descripcion, color, activo, modo } =
      await request.json();
    const url = new URL(request.url);
    const idCategoria = url.searchParams.get('id');

    const empresaId = locals.user?.empresaId;
    console.log('esto son los datos de entrada', activo, modo, idCategoria);
    if (!locals.user) {
      return createResponse(401, 'No autenticado');
    }
    const isCategoriaExistente = await db
      .select()
      .from(categorias)
      .where(eq(categorias.id, id || idCategoria))
      .limit(1);
    if (!isCategoriaExistente) {
      return createResponse(404, 'Categoria no encontrada');
    }
    if (modo === 'activacion') {
      console.log('modo actiacion', activo);
      const categoria = await db
        .update(categorias)
        .set({
          activo: activo,
        })
        .where(eq(categorias.id, idCategoria))
        .returning();
      return createResponse(200, 'Categoria actualizada', categoria[0]);
    }
    const nombreLowerCase = nombre.toLowerCase();
    const categoria = await db
      .update(categorias)
      .set({
        nombre: nombreLowerCase,
        descripcion,
        color,
        empresaId,
      })
      .where(eq(categorias.id, id))
      .returning();
    return createResponse(200, 'Categoria actualizada', categoria[0]);
  } catch (error) {
    console.error('Error al actualizar categoria:', error);
    return createResponse(500, 'Error al actualizar categoria');
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const newUrl = new URL(request.url);
  const id = newUrl.searchParams.get('id');
  try {
    const empresaId = locals.user?.empresaId;
    if (!locals.user) {
      return createResponse(401, 'No autenticado');
    }
    if (locals.user.rol !== 'admin') {
      return createResponse(402, 'No Autorizado');
    }
    const isCategoriaExistente = (
      await db.select().from(categorias).where(eq(categorias.id, id))
    ).at(0);

    if (!isCategoriaExistente) {
      return createResponse(404, 'Categoria no encontrada');
    }
    const [categoria] = await db
      .delete(categorias)
      .where(eq(categorias.id, id))
      .returning();

    console.log('categoria eliminada ->', categoria);
    return createResponse(200, 'Categoria eliminada', categoria);
  } catch (error) {
    console.error('Error al eliminar categoria:', error);
    return createResponse(500, 'Error al eliminar categoria');
  }
};
