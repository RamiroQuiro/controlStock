import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../schema';
import { deleteCompanyCascade } from './delete-company-cascade';
import 'dotenv/config';

async function main() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_DB_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('❌ Error: TURSO_DB_URL y TURSO_DB_AUTH_TOKEN son requeridos en .env');
    process.exit(1);
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  // ID de la empresa a resetear (RamaCode Test)
  const empresaId = 'empresa-XUItlVcgxsf_SE';

  console.log(`🚀 Iniciando reset para empresa: ${empresaId}`);
  
  const result = await deleteCompanyCascade(empresaId, db);

  if (result.success) {
    console.log('✅ Base de datos limpiada con éxito.');
  } else {
    console.log('❌ Error al limpiar base de datos:', result.error);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('💥 Error inesperado:', err);
  process.exit(1);
});
