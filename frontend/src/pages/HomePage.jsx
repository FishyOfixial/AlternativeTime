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
      <section className="grid overflow-hidden rounded-[22px] border border-[#d9ccb8] bg-[#fbf7f0] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex min-h-[520px] flex-col items-center justify-center bg-[#211b16] px-8 py-12 text-center">
          <p className="font-serif text-5xl font-semibold leading-tight text-[#d7ae57]">
            Alternative
            <br />
            Time Co.
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.38em] text-[#7d6a53]">
            Vintage · Classic · Timeless
          </p>
          <div className="mt-10 h-px w-44 bg-[#6a5431]" />
          <p className="mt-6 text-sm italic text-[#82715d]">
            Sistema de Punto de Venta
          </p>
        </div>

        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <p className="eyebrow">Sprint Frontend 1</p>
          <h2 className="mt-4 max-w-xl font-serif text-4xl tracking-tight text-[#2a221b] sm:text-5xl">
            La web ya tiene una base visual alineada a los mockups.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#736350] sm:text-lg">
            Ya existen rutas reales, layouts compartidos y una capa de
            servicios. El siguiente paso es poblar esta estructura con auth,
            dashboard y modulos operativos.
          </p>
          <div className="mt-8">{footerSlot}</div>
          <p className="mt-10 border-t border-[#ddcfba] pt-6 text-xs text-[#a18a6d]">
            ATCoPOS v1.0 · Django + React + Tailwind
          </p>
        </div>
      </section>

      {health.status === "loading" ? (
        <LoadingState message="Probando el servicio base para la landing." />
      ) : null}

      {health.status === "error" ? (
        <ErrorState message={health.message} />
      ) : null}

      {health.status !== "loading" && health.status !== "error" ? (
        <section className="grid gap-5 md:grid-cols-3">
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
              Estado API
            </p>
            <p className="mt-3 font-serif text-[34px] text-[#2a221b]">
              {health.status}
            </p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
              Base de datos
            </p>
            <p className="mt-3 font-serif text-[34px] text-[#b2883e]">
              {health.database}
            </p>
          </article>
          <article className="stat-card">
            <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
              Mensaje
            </p>
            <p className="mt-3 text-base leading-6 text-[#5f5243]">
              {health.message}
            </p>
          </article>
        </section>
      ) : null}
    </div>
  );
}
