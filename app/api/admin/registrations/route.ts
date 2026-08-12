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
  const analytics = await sql`
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS "visitors",
      COUNT(*) FILTER (WHERE event_type = 'presave_click')::int AS "presaveClicks"
    FROM analytics_events
  `;
  return Response.json({
    registrations: rows,
    analytics: analytics[0] ?? { visitors: 0, presaveClicks: 0 },
  });
}
