import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts', // 🚀 Asegura que Drizzle solo lea lo que exportamos aquí (ignota archivos sueltos como FTS)
  dialect: 'turso',
  dbCredentials: {
    url:process.env.TURSO_DB_URL!,
    authToken:process.env.TURSO_DB_AUTH_TOKEN
  },
  tablesFilter: ["!*productos_fts*"],
});
