import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CatalogShell from "../components/catalog/CatalogShell";
import ContactLinks from "../components/catalog/ContactLinks";
import { getCatalogItem } from "../services/catalog";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

export default function CatalogDetailPage() {
  const { itemId } = useParams();
  const [state, setState] = useState({ status: "loading", item: null });

  useEffect(() => {
    getCatalogItem(itemId)
      .then((item) => setState({ status: "ready", item }))
      .catch(() => setState({ status: "error", item: null }));
  }, [itemId]);

  return (
    <CatalogShell>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-14">
        <Link className="text-xs uppercase tracking-[0.25em] text-[#9f8959] hover:text-[#c8ae74]" to="/catalog">← Volver a la colección</Link>
        {state.status === "loading" && <p className="py-32 text-center text-[#aaa69d]">Cargando pieza…</p>}
        {state.status === "error" && <div className="py-32 text-center"><h1 className="font-brand text-4xl">Pieza no disponible</h1><p className="mt-4 text-[#918f88]">Este reloj ya no forma parte del catálogo.</p></div>}
        {state.item && (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div className="aspect-[4/5] overflow-hidden bg-[#181916]">
              {state.item.primary_image_url ? (
                <img alt={state.item.display_name} className="h-full w-full object-cover" src={state.item.primary_image_url} />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,#292923,#111210_70%)] text-8xl text-[#b99a59]/40">◷</div>
              )}
            </div>
            <div className="flex flex-col justify-center lg:py-8">
              <p className="text-xs uppercase tracking-[0.4em] text-[#b69857]">{state.item.brand}</p>
              <h1 className="mt-4 font-brand text-5xl leading-none text-white sm:text-6xl">{state.item.model_name}</h1>
              {state.item.year_label && <p className="mt-3 text-sm text-[#77766f]">{state.item.year_label}</p>}
              <p className="mt-8 text-3xl text-[#d4b874]">{money.format(Number(state.item.price))}</p>
              <div className="mt-8 flex gap-8 border-y border-white/10 py-5 text-sm">
                <div><p className="text-[10px] uppercase tracking-[.25em] text-[#6f6f69]">Estado</p><p className="mt-2 text-[#d9d4ca]">{state.item.availability}</p></div>
                <div><p className="text-[10px] uppercase tracking-[.25em] text-[#6f6f69]">Existencia</p><p className="mt-2 text-[#d9d4ca]">{state.item.stock} pieza</p></div>
                <div><p className="text-[10px] uppercase tracking-[.25em] text-[#6f6f69]">Condición</p><p className="mt-2 text-[#d9d4ca]">{state.item.condition_score}/10</p></div>
              </div>
              <p className="mt-8 whitespace-pre-line text-base leading-8 text-[#aaa69d]">{state.item.description || "Solicita más información sobre esta pieza y su historia."}</p>
              <div className="mt-9"><ContactLinks productName={state.item.display_name} /></div>
            </div>
          </div>
        )}
      </main>
    </CatalogShell>
  );
}
