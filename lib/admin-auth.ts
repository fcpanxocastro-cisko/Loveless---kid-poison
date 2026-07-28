const COOKIE_NAME = "loveless_admin";

function secrets() {
  return {
    password: process.env.ADMIN_PASSWORD,
    session: process.env.ADMIN_SESSION_SECRET,
  };
}

export function validAdminPassword(value: string) {
  const { password } = secrets();
  return Boolean(password && value === password);
}

export function isAdmin(request: Request) {
  const { session } = secrets();
  if (!session) return false;
  const cookies = request.headers.get("cookie") ?? "";
  const token = cookies
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === COOKIE_NAME)?.[1];
  return token === session;
}

export function adminCookie() {
  const { session } = secrets();
  if (!session) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return `${COOKIE_NAME}=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;
}
