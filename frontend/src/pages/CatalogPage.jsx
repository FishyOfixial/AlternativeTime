import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CatalogShell from "../components/catalog/CatalogShell";
import ContactLinks from "../components/catalog/ContactLinks";
import { listCatalog } from "../services/catalog";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

function WatchImage({ item }) {
  if (item.primary_image_url) {
    return <img alt={item.display_name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" src={item.primary_image_url} />;
  }
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,#292923,#161715_68%)]">
      <span className="text-6xl font-light text-[#b99a59]/50">◷</span>
    </div>
  );
}

export default function CatalogPage() {
  const [state, setState] = useState({ status: "loading", items: [] });

  useEffect(() => {
    listCatalog()
      .then((items) => setState({ status: "ready", items }))
      .catch(() => setState({ status: "error", items: [] }));
  }, []);

  return (
    <CatalogShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(187,151,78,.2),transparent_26%),linear-gradient(115deg,#131512,#080909)]" />
          <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-[#c4a45f]">Colección disponible</p>
              <h1 className="mt-5 max-w-3xl font-brand text-5xl leading-[.92] text-white sm:text-7xl lg:text-8xl">
                El tiempo, elegido con intención.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#aaa69d] sm:text-lg">
                Piezas seleccionadas para quienes entienden que un buen reloj no solo mide el tiempo: lo acompaña.
              </p>
              <div className="mt-8"><ContactLinks /></div>
            </div>
            <div className="hidden justify-self-end lg:block">
              <div className="h-72 w-72 rounded-full border border-[#c4a45f]/30 bg-[radial-gradient(circle,#272820_0%,#10110f_65%)] shadow-[0_0_90px_rgba(196,164,95,.12)]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.36em] text-[#a7894d]">En inventario</p>
              <h2 className="mt-3 font-brand text-3xl text-white sm:text-5xl">Relojes disponibles</h2>
            </div>
            {state.status === "ready" && <p className="text-sm text-[#77766f]">{state.items.length} piezas</p>}
          </div>

          {state.status === "loading" && <p className="py-24 text-center text-[#aaa69d]">Preparando la colección…</p>}
          {state.status === "error" && <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-[#c8c1b5]">No pudimos cargar el catálogo. Intenta de nuevo en unos minutos.</p>}
          {state.status === "ready" && !state.items.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-[#aaa69d]">Muy pronto habrá nuevas piezas disponibles.</p>}

          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {state.items.map((item) => (
              <article className="group" key={item.id}>
                <Link to={`/catalog/${item.id}`}>
                  <div className="aspect-[4/5] overflow-hidden rounded-[2px] bg-[#181916]"><WatchImage item={item} /></div>
                  <div className="border-b border-white/10 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9c8148]">{item.brand}</p>
                        <h3 className="mt-2 text-xl text-[#f1ede5]">{item.model_name}</h3>
                      </div>
                      <span className={`mt-1 h-2 w-2 rounded-full ${item.status === "available" ? "bg-[#7da071]" : "bg-[#bf9b50]"}`} />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-lg text-[#cdb274]">{money.format(Number(item.price))}</p>
                      <p className="text-xs text-[#77766f]">{item.availability}</p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </CatalogShell>
  );
}
