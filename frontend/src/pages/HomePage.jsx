import { useEffect, useState } from "react";
import ErrorState from "../components/feedback/ErrorState";
import LoadingState from "../components/feedback/LoadingState";
import { getHealth } from "../services/health";

const initialHealth = {
  status: "loading",
  message: "Conectando con la API...",
  database: "unknown"
};

export default function HomePage({ footerSlot = null }) {
  const [health, setHealth] = useState(initialHealth);

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
    <div className="flex flex-col gap-6">
      <section className="panel-surface p-8 sm:p-10">
        <p className="eyebrow">React + Vite + Tailwind</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          El frontend ya tiene rutas reales, layouts compartidos y una capa de
          servicios preparada para crecer.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
          Este sprint no implementa modulos de negocio todavia. Deja la base de
          aplicacion lista para Sprint 2 y Sprint 3 sin seguir cargando toda la
          UI en un solo archivo.
        </p>
        <div className="mt-8">{footerSlot}</div>
      </section>

      {health.status === "loading" ? (
        <LoadingState message="Probando el servicio base para la landing." />
      ) : null}

      {health.status === "error" ? (
        <ErrorState message={health.message} />
      ) : null}

      {health.status !== "loading" && health.status !== "error" ? (
        <section className="grid gap-5 md:grid-cols-3">
          <article className="panel-soft p-5">
            <p className="text-sm text-slate-400">Estado API</p>
            <p className="mt-3 text-2xl font-semibold text-cyan-200">
              {health.status}
            </p>
          </article>
          <article className="panel-soft p-5">
            <p className="text-sm text-slate-400">Base de datos</p>
            <p className="mt-3 text-2xl font-semibold text-orange-200">
              {health.database}
            </p>
          </article>
          <article className="panel-soft p-5">
            <p className="text-sm text-slate-400">Mensaje</p>
            <p className="mt-3 text-base leading-6 text-slate-200">
              {health.message}
            </p>
          </article>
        </section>
      ) : null}
    </div>
  );
}
