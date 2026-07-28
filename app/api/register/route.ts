import { ensureSchema } from "../../../lib/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { name?: string; email?: string };
    const name = payload.name?.trim().slice(0, 100) ?? "";
    const email = payload.email?.trim().toLowerCase().slice(0, 160) ?? "";

    if (name.length < 2) return Response.json({ error: "Ingresa tu nombre." }, { status: 400 });
    if (!emailPattern.test(email)) return Response.json({ error: "Ingresa un correo válido." }, { status: 400 });

    const sql = await ensureSchema();
    await sql`INSERT INTO registrations (name, email) VALUES (${name}, ${email})`;
    return Response.json({ ok: true }, { status: 201 });
  } catch (reason) {
    const message = reason instanceof Error ? `${reason.message} ${reason.cause ?? ""}` : "";
    if (message.includes("duplicate key") || message.includes("23505")) {
      return Response.json({ error: "Este correo ya está participando." }, { status: 409 });
    }
    return Response.json({ error: "No pudimos completar tu registro. Inténtalo nuevamente." }, { status: 500 });
  }
}
