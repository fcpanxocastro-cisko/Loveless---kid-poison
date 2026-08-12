import { ensureSchema } from "../../../lib/db";

const allowedTypes = new Set(["page_view", "presave_click"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { type?: string; visitorId?: string };
    const type = payload.type ?? "";
    const visitorId = payload.visitorId?.trim().slice(0, 100) ?? "";

    if (!allowedTypes.has(type) || visitorId.length < 8) {
      return Response.json({ error: "Evento inválido." }, { status: 400 });
    }

    const sql = await ensureSchema();
    await sql`
      INSERT INTO analytics_events (event_type, visitor_id)
      VALUES (${type}, ${visitorId})
      ON CONFLICT (event_type, visitor_id) DO NOTHING
    `;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "No se pudo registrar la métrica." }, { status: 500 });
  }
}
