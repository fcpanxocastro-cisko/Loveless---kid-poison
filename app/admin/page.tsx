"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Analytics = {
  visitors: number;
  presaveClicks: number;
};

type Registration = {
  id: number;
  name: string;
  email: string;
  winner: number;
  selectedAt: string | null;
  createdAt: string;
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Registration[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ visitors: 0, presaveClicks: 0 });
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/registrations", { cache: "no-store" });
    if (response.status === 401) return setAuthorized(false);
    const data = (await response.json()) as { registrations: Registration[]; analytics: Analytics };
    setRows(data.registrations);
    setAnalytics(data.analytics ?? { visitors: 0, presaveClicks: 0 });
    setAuthorized(true);
  }

  useEffect(() => { void load(); }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });
    if (!response.ok) return setError("Clave incorrecta.");
    await load();
  }

  async function draw() {
    if (!confirm("¿Realizar ahora el sorteo aleatorio de hasta 70 ganadores?")) return;
    setBusy(true);
    await fetch("/api/admin/draw", { method: "POST" });
    await load();
    setBusy(false);
  }

  const filtered = useMemo(() => {
    const value = query.toLowerCase();
    return rows.filter((row) => `${row.name} ${row.email}`.toLowerCase().includes(value));
  }, [rows, query]);

  function downloadCsv() {
    const lines = [
      ["Nombre", "Correo", "Fecha", "Ganador"],
      ...rows.map((row) => [row.name, row.email, row.createdAt, row.winner ? "Sí" : "No"]),
    ];
    const csv = lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "loveless-participantes.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (authorized === null) return <main className="adminShell"><p>Cargando…</p></main>;
  if (!authorized) return (
    <main className="adminShell loginShell">
      <form className="loginCard" onSubmit={login}>
        <p className="adminKicker">POISON KID · LOVELESS</p>
        <h1>Panel privado</h1>
        <label>Clave administrativa<input name="password" type="password" required autoFocus /></label>
        <button>INGRESAR</button>
        {error && <p className="adminError">{error}</p>}
      </form>
    </main>
  );

  const winners = rows.filter((row) => row.winner).length;
  return (
    <main className="adminShell">
      <header className="adminHeader">
        <div><p className="adminKicker">POISON KID · LOVELESS</p><h1>Participantes</h1></div>
        <a href="/">Ver landing</a>
      </header>
      <section className="metrics">
        <article><span>VISITANTES ÚNICOS</span><b>{analytics.visitors}</b></article>
        <article><span>CLICS EN PRE-SAVE</span><b>{analytics.presaveClicks}</b></article>
        <article><span>REGISTROS</span><b>{rows.length}</b></article>
        <article><span>GANADORES</span><b>{winners}</b></article>
        <article><span>DISPONIBLES</span><b>{Math.min(rows.length, 70)}</b></article>
      </section>
      <section className="adminActions">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre o correo" />
        <button onClick={downloadCsv}>DESCARGAR CSV</button>
        <button className="drawButton" onClick={draw} disabled={busy || rows.length === 0}>{busy ? "SORTEANDO…" : "SORTEAR 70"}</button>
      </section>
      <div className="tableWrap">
        <table>
          <thead><tr><th>Nombre</th><th>Correo</th><th>Registro</th><th>Estado</th></tr></thead>
          <tbody>{filtered.map((row) => (
            <tr key={row.id} className={row.winner ? "winnerRow" : ""}>
              <td>{row.name}</td><td>{row.email}</td><td>{new Date(row.createdAt).toLocaleString("es-CL")}</td><td>{row.winner ? "GANADOR/A" : "Participante"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </main>
  );
}
