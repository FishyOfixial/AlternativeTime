import { useEffect, useState } from "react";

const initialState = {
  status: "loading",
  message: "Conectando con la API...",
  database: "unknown"
};

export default function App() {
  const [health, setHealth] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      try {
        const response = await fetch("/api/health/");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setHealth(data);
        }
      } catch {
        if (!cancelled) {
          setHealth({
            status: "error",
            message: "No fue posible conectar con Django REST API.",
            database: "unknown"
          });
        }
      }
    }

    loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-6 py-16 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Django REST + React + Vite
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Workspace listo para arrancar Alternative Time.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            El frontend corre en Vite con Tailwind y consume la API Django por
            proxy local. En desarrollo usa SQLite y en produccion puedes cambiar
            a PostgreSQL desde variables de entorno.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Estado API</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-300">
              {health.status}
            </p>
          </article>

          <article className="rounded-2xl border border-orange-400/20 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Base de datos</p>
            <p className="mt-2 text-2xl font-semibold text-orange-300">
              {health.database}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Mensaje</p>
            <p className="mt-2 text-base text-slate-200">{health.message}</p>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
          <h2 className="text-xl font-semibold text-white">Siguientes pasos</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="text-sm text-cyan-300">Backend</p>
              <p className="mt-2 text-slate-300">
                Activa `.venv`, ejecuta migraciones y levanta Django en el
                puerto 8000.
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="text-sm text-orange-300">Frontend</p>
              <p className="mt-2 text-slate-300">
                Corre `npm run dev` dentro de `frontend` para trabajar con Vite.
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="text-sm text-emerald-300">Produccion</p>
              <p className="mt-2 text-slate-300">
                Cambia `DB_ENGINE=postgres` y completa las credenciales de
                PostgreSQL.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
