import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { getHealth } from "../services/health";

const initialHealth = {
  status: "loading",
  message: "Conectando con la API...",
  database: "unknown"
};

function getStatusAccent(status) {
  if (status === "ok" || status === "healthy" || status === "success") {
    return {
      badge: "border-[#c9ddc7] bg-[#edf7ee] text-[#426748]",
      dot: "bg-[#6f9e68]",
      panel: "from-[#21311f] via-[#1c251a] to-[#161c14]",
      text: "Operando con normalidad"
    };
  }

  if (status === "error") {
    return {
      badge: "border-[#e8c3bb] bg-[#fff1ed] text-[#96584b]",
      dot: "bg-[#c26d5f]",
      panel: "from-[#35211d] via-[#2b1b18] to-[#1d1412]",
      text: "Se detectaron problemas de conexion"
    };
  }

  return {
    badge: "border-[#e2d6c1] bg-[#faf4ea] text-[#7b6954]",
    dot: "bg-[#b69556]",
    panel: "from-[#31271f] via-[#261f18] to-[#1b1712]",
    text: "Esperando respuesta del servicio"
  };
}

export default function HomePage() {
  const [health, setHealth] = useState(initialHealth);
  const accent = getStatusAccent(health.status);

  useEffect(() => {
    let active = true;

    getHealth()
      .then((data) => {
        if (active) {
          setHealth(data);
        }
      })
      .catch(() => {
        if (active) {
          setHealth({
            status: "error",
            message: "No fue posible conectar con Django REST API.",
            database: "unknown"
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(177,138,68,0.18),transparent_55%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="grid overflow-hidden rounded-[28px] border border-[#dacdb8] bg-[#fbf7f0] shadow-[0_20px_60px_rgba(48,35,20,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
          <div
            className={`relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-gradient-to-br ${accent.panel} px-6 py-7 text-[#f5ecdc] sm:px-8 sm:py-8`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,182,95,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(214,174,87,0.16),transparent_24%)]" />

            <div className="relative">
              <p className="font-brand text-3xl leading-none text-[#ddb65f] sm:text-4xl">
                Alternative
                <br />
                Time Co.
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#a69073]">
                Vintage | Classic | Timeless
              </p>
            </div>

            <div className="relative max-w-lg">
              <div
                className={`inline-flex items-center gap-3 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${accent.badge}`}
              >
                <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                Healthcheck en vivo
              </div>

              <h1 className="mt-5 font-serif text-3xl leading-tight text-[#fff7ea] sm:text-4xl">
                Estado rapido del sistema.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#d8ccb8] sm:text-base">
                API, base de datos y acceso directo al endpoint en una sola vista.
              </p>
            </div>

            <div className="mt-4 relative grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[#4b3d2b] bg-[rgba(251,247,240,0.06)] p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#ab9574]">
                  Estado actual
                </p>
                <p className="mt-2 font-serif text-[20px] text-[#fff7ea]">
                  {health.status}
                </p>
                <p className="mt-1 text-[10px] text-[#cbbda8]">{accent.text}</p>
              </div>

              <div className="rounded-[20px] border border-[#4b3d2b] bg-[rgba(251,247,240,0.06)] p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#ab9574]">
                  Base de datos
                </p>
                <p className="mt-2 font-serif text-[20px] text-[#f0cd84]">
                  {health.database}
                </p>
              </div>

              <div className="rounded-[20px] border border-[#4b3d2b] bg-[rgba(251,247,240,0.06)] p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#ab9574]">
                  Endpoint base
                </p>
                <p className="mt-2 break-all font-mono text-sm text-[#f5ecdc]">
                  /api/health/
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between px-6 py-7 sm:px-8 sm:py-8">
            <div>
              <p className="eyebrow">Healthcheck</p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight text-[#2a221b] sm:text-4xl">
                Resumen compacto.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#6f604f] sm:text-base">
                Si algo falla aqui, abre el endpoint y compara la respuesta antes
                de entrar al dashboard.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[20px] border border-[#dfd1bb] bg-[#f7f1e6] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#af9367]">
                  Mensaje
                </p>
                <p className="mt-2 text-sm leading-6 text-[#5d5043]">
                  {health.message}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <NavLink className="gold-button" to="/login">
                  Ir a login
                </NavLink>
                <a
                  className="inline-flex items-center justify-center rounded-lg border border-[#ddcfba] bg-[#fcf8f2] px-5 py-3 text-sm font-semibold text-[#7d6751] transition hover:bg-[#f3ecde]"
                  href="http://127.0.0.1:8000/api/health/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver health endpoint
                </a>
              </div>
            </div>
          </div>
        </section>

        {health.status === "loading" ? (
          <LoadingState message="Probando el servicio base para el healthcheck." />
        ) : null}

        {health.status === "error" ? (
          <ErrorState message={health.message} />
        ) : null}
      </div>
    </div>
  );
}
