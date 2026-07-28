import { adminCookie, validAdminPassword } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json()) as { password?: string };
  if (!validAdminPassword(payload.password ?? "")) {
    return Response.json({ error: "Clave incorrecta." }, { status: 401 });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": adminCookie() },
  });
}
