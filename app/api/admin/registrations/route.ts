import { ensureSchema } from "../../../../lib/db";
import { isAdmin } from "../../../../lib/admin-auth";

export async function GET(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "No autorizado." }, { status: 401 });
  const sql = await ensureSchema();
  const rows = await sql`
    SELECT id, name, email, winner,
      selected_at AS "selectedAt",
      created_at AS "createdAt"
    FROM registrations
    ORDER BY created_at DESC
  `;
  return Response.json({ registrations: rows });
}
