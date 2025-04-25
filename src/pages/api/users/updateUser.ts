import { users } from '../../../db/schema/users';
import { eq } from 'drizzle-orm';
import db from '../../../db';
import fs from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  const {
    id,
    nombre,
    srcPhoto,
    apellido,
    documento,
    email,
    telefono,
    direccion,
  } = await request.json();
  console.log(id, nombre, srcPhoto, apellido, email, telefono, direccion);
  if (!id) {
    return new Response(JSON.stringify({ error: 'Falta el id de usuario' }), {
      status: 400,
    });
  }

  let photoPath = null;

  // Si viene una imagen en base64, la guardamos en disco
  if (srcPhoto && srcPhoto.startsWith('data:image')) {
    try {
      // Extraer el tipo de imagen y los datos base64
      const matches = srcPhoto.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (!matches) throw new Error('Formato de imagen inválido');
      const ext = matches[1].split('/')[1]; // "jpeg" o "png"
      const data = matches[2];
      const userDir = path.join(process.cwd(), 'element', 'imgs', id);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      photoPath = path.join(userDir, `avatar.${ext}`);
      fs.writeFileSync(photoPath, Buffer.from(data, 'base64'));
      // Guardamos la ruta relativa para la base de datos (para usar en src)
      photoPath = `/element/imgs/${id}/avatar.${ext}`;
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Error al guardar la imagen',
          details: error.message,
        }),
        { status: 500 }
      );
    }
  }

  try {
    const [userUpdate] = await db
      .update(users)
      .set({
        nombre,
        documento,
        apellido,
        email,
        telefono,
        direccion,
        ...(photoPath && { srcPhoto: photoPath }),
      })
      .where(eq(users.id, id))
      .returning();

    return new Response(
      JSON.stringify({ msg: 'Usuario actualizado', data: userUpdate }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Error al actualizar usuario',
        details: error.message,
      }),
      { status: 500 }
    );
  }
};
