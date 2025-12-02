import type { APIRoute } from "astro";
import { deleteCompanyCascade } from "../../../db/scripts/delete-company-cascade";
import db from "../../../db";

export const POST: APIRoute = async ({ request }) => {
  const { empresaId, secret } = await request.json();

  const ADMIN_SECRET = "admin-delete-confirm-123";

  if (secret !== ADMIN_SECRET) {
    return new Response(JSON.stringify({ msg: "No autorizado" }), {
      status: 403,
    });
  }

  if (!empresaId) {
    return new Response(JSON.stringify({ msg: "Falta empresaId" }), {
      status: 400,
    });
  }

  const result = await deleteCompanyCascade(empresaId, db);

  if (result.success) {
    return new Response(JSON.stringify(result), { status: 200 });
  } else {
    return new Response(JSON.stringify(result), { status: 500 });
  }
};
