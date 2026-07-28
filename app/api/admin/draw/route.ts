import { ensureSchema } from "../../../../lib/db";
import { isAdmin } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "No autorizado." }, { status: 401 });
  const sql = await ensureSchema();
  await sql`
    WITH chosen AS (
      SELECT id FROM registrations ORDER BY RANDOM() LIMIT 70
    )
    UPDATE registrations
    SET
      winner = id IN (SELECT id FROM chosen),
      selected_at = CASE
        WHEN id IN (SELECT id FROM chosen) THEN NOW()
        ELSE NULL
      END
  `;
  return Response.json({ ok: true });
}
