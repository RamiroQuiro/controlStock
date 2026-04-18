import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import db from "../db";
import { sessions, users } from "../db/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users); // your adapter

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      userName: attributes.userName,
      nombre: attributes.nombre,
      apellido: attributes.apellido,
      email: attributes.email,
      rol: attributes.rol,
      empresaId: attributes.empresaId,
      razonSocial: attributes.razonSocial,
      srcPhoto: attributes.srcPhoto,
      activo: attributes.activo,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  userName: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  empresaId: string;
  razonSocial: string;
  srcPhoto: string;
  activo: number;
}
