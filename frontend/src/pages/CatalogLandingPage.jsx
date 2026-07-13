import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CatalogProductCard from "../components/catalog/CatalogProductCard";
import CatalogShell from "../components/catalog/CatalogShell";
import { listCatalog } from "../services/catalog";

export default function CatalogLandingPage() {
  const [latestState, setLatestState] = useState({ status: "loading", items: [] });

  useEffect(() => {
    let active = true;

    listCatalog({ page: 1, page_size: 4, ordering: "newest" }, {
      onUpdate: (payload) => {
        if (active) {
          setLatestState({ status: "ready", items: payload.results || [] });
        }
      }
    })
      .then((payload) => {
        if (active) {
          setLatestState({ status: "ready", items: payload.results || [] });
        }
      })
      .catch(() => {
        if (active) {
          setLatestState({ status: "error", items: [] });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CatalogShell>
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(196,164,95,.18),transparent_26%),radial-gradient(circle_at_82%_62%,rgba(255,255,255,.07),transparent_24%),linear-gradient(135deg,#111210_0%,#070808_58%,#15120b_100%)]" />
        <section className="mx-auto grid min-h-[calc(72vh-82px)] max-w-7xl items-center gap-12 px-5 pb-10 pt-16 sm:px-8 sm:pb-12 lg:grid-cols-[1fr_.78fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#c4a45f]">
              Relojes vintage y atemporales
            </p>
            <h1 className="mt-5 max-w-3xl font-brand text-5xl leading-[.92] text-white sm:text-7xl lg:text-8xl">
              Vendemos relojes con historia.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#aaa69d] sm:text-lg">
              Piezas seleccionadas por su carácter, época y presencia. Cada reloj conserva una historia propia y está listo para acompañar la siguiente.
            </p>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-[2rem] border border-[#c4a45f]/20 bg-[linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.018))] p-8 shadow-[0_40px_120px_rgba(0,0,0,.38)]">
              <p className="text-xs uppercase tracking-[0.36em] text-[#b99a59]">Curaduría</p>
              <p className="mt-6 font-brand text-5xl leading-none text-white">
                Vintage.
                <br />
                Atemporal.
                <br />
                Con historia.
              </p>
              <div className="mt-10 h-px bg-[#c4a45f]/25" />
            <p className="mt-6 text-sm leading-7 text-[#aaa69d]">
              Un catálogo vivo de relojes seleccionados para quienes buscan algo más que una pieza nueva: buscan una pieza con alma.
            </p>
          </div>
        </div>
        </section>
        <section className="mx-auto max-w-7xl px-3 pb-16 pt-2 sm:px-8 sm:pb-24 sm:pt-4">
          <div className="mb-7 flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-[#a7894d]">Últimas piezas</p>
              <h2 className="mt-3 font-brand text-3xl text-white sm:text-5xl">Recién agregados</h2>
            </div>
            <Link
              className="inline-flex w-fit items-center justify-center rounded-full border border-[#c4a45f]/35 px-5 py-2.5 text-sm font-semibold text-[#d4b874] transition hover:border-[#d4b874] hover:bg-[#d4b874]/10"
              to="/catalogo"
            >
              Ver catálogo completo
            </Link>
          </div>

          {latestState.status === "loading" ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <article className="animate-pulse" key={index}>
                  <div className="aspect-[3/4] rounded-[2px] bg-white/[0.06] sm:aspect-[4/5]" />
                  <div className="border-b border-white/10 py-3 sm:py-5">
                    <div className="h-4 w-4/5 rounded-full bg-white/[0.08]" />
                    <div className="mt-3 h-4 w-2/3 rounded-full bg-[#c4a45f]/15" />
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {latestState.status === "ready" && latestState.items.length ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-6 lg:grid-cols-4">
              {latestState.items.map((item, index) => (
                <CatalogProductCard item={item} key={item.id} priority={index < 2} />
              ))}
            </div>
          ) : null}
        </section>

        <section className="mx-auto max-w-7xl px-3 pb-16 sm:px-8 sm:pb-24">
          <div className="overflow-hidden rounded-[2rem] border border-[#c4a45f]/20 bg-[linear-gradient(135deg,rgba(196,164,95,.14),rgba(255,255,255,.045)_45%,rgba(255,255,255,.02))] p-6 shadow-[0_30px_100px_rgba(0,0,0,.28)] sm:p-8 lg:p-10">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-[#c4a45f]">Vende tu reloj</p>
                <h2 className="mt-3 font-brand text-3xl leading-tight text-white sm:text-5xl">
                  Compramos piezas con historia.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aaa69d] sm:text-base">
                  Si tienes un reloj vintage o atemporal que deseas vender, te guiamos con un proceso claro, seguro y sin complicaciones.
                </p>
              </div>
              <Link
                className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-[#c9a85f] px-7 py-3 text-sm font-semibold text-[#16130f] transition hover:bg-[#dfc075]"
                to="/vender-reloj"
              >
                Vender mi reloj
              </Link>
            </div>
          </div>
        </section>
      </main>
    </CatalogShell>
  );
}
