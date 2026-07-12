import { Link } from "react-router-dom";
import CatalogShell from "../components/catalog/CatalogShell";

export default function CatalogLandingPage() {
  return (
    <CatalogShell>
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(196,164,95,.18),transparent_26%),radial-gradient(circle_at_82%_62%,rgba(255,255,255,.07),transparent_24%),linear-gradient(135deg,#111210_0%,#070808_58%,#15120b_100%)]" />
        <section className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_.78fr]">
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
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#c9a85f] px-7 py-3 text-sm font-semibold text-[#16130f] transition hover:bg-[#dfc075]"
                to="/catalogo"
              >
                Ver catálogo
              </Link>
            </div>
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
      </main>
    </CatalogShell>
  );
}
