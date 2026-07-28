"use client";

import { FormEvent, useState } from "react";

const PRESAVE_URL = "https://vm.group/loveless-skj-y";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(true);
  const [presaveDone, setPresaveDone] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function goToPresave() {
    setPresaveDone(true);
    window.open(PRESAVE_URL, "_blank", "noopener,noreferrer");
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email") }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "No pudimos registrar tus datos.");
      setState("success");
    } catch (reason) {
      setState("error");
      setError(reason instanceof Error ? reason.message : "Inténtalo nuevamente.");
    }
  }

  return (
    <main className="experience">
      <div className="texture" aria-hidden="true" />

      <header className="topbar">
        <span className="brand">POISON KID</span>
        <span>13 · 08 · 2026</span>
      </header>

      <section className="hero">
        <div className="copy">
          <p className="overline">NUEVO LANZAMIENTO</p>
          <h1>LOVELESS</h1>
          <p className="summary">
            Pre-save exclusivo y sorteo de 70 invitaciones para el preview
            listening en Providencia, Santiago.
          </p>
          <button className="outlineButton" onClick={() => setModalOpen(true)}>
            PARTICIPAR AHORA
          </button>
        </div>

        <div className="portraitArea">
          <img src="/poison-kid.jpg" alt="Poison Kid" className="portrait" />
          <div className="badge"><b>70</b><span>INVITACIONES</span></div>
        </div>
      </section>

      <footer>
        <span>PREVIEW LISTENING</span>
        <span>PROVIDENCIA · SANTIAGO</span>
      </footer>

      {modalOpen && (
        <div className="backdrop">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <button className="close" onClick={() => setModalOpen(false)} aria-label="Cerrar">×</button>

            {state === "success" ? (
              <div className="success">
                <span className="check">✓</span>
                <p className="redLabel">REGISTRO CONFIRMADO</p>
                <h2>YA ESTÁS PARTICIPANDO.</h2>
                <p>
                  Sortearemos 70 invitaciones. Si resultas seleccionado,
                  recibirás por correo los detalles del preview listening.
                </p>
                <button className="darkButton" onClick={() => setModalOpen(false)}>
                  VOLVER A LOVELESS
                </button>
              </div>
            ) : (
              <>
                <p className="redLabel">EXPERIENCIA PRIVADA · 70 INVITACIONES</p>
                <h2 id="dialog-title">ESCUCHA LOVELESS ANTES QUE NADIE.</h2>
                <p className="intro">
                  Haz el pre-save y registra tus datos para participar en el
                  sorteo del preview listening de Poison Kid.
                </p>

                <div className="steps">
                  <div className={presaveDone ? "step done" : "step current"}><span>01</span><b>PRE-SAVE</b></div>
                  <div className={presaveDone ? "step current" : "step"}><span>02</span><b>REGISTRO</b></div>
                </div>

                {!presaveDone ? (
                  <button className="redButton" onClick={goToPresave}>
                    HACER PRE-SAVE DE LOVELESS <span>↗</span>
                  </button>
                ) : (
                  <form onSubmit={register}>
                    <p className="returnNotice">Tu formulario ya está listo. Completa el pre-save y vuelve a esta pestaña para registrarte.</p>
                    <label>
                      Nombre
                      <input name="name" autoComplete="name" required minLength={2} placeholder="Tu nombre" />
                    </label>
                    <label>
                      Correo electrónico
                      <input name="email" type="email" autoComplete="email" required placeholder="tu@correo.com" />
                    </label>
                    <button className="redButton" disabled={state === "sending"}>
                      {state === "sending" ? "REGISTRANDO..." : "PARTICIPAR EN EL SORTEO"}
                    </button>
                    {state === "error" && <p className="formError" role="alert">{error}</p>}
                  </form>
                )}

                <p className="terms">
                  Inscripciones abiertas. Cada correo participa una sola vez.
                  Registrarse no garantiza una invitación; los 70 seleccionados
                  serán notificados por correo.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
