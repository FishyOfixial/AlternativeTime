import { Link } from "react-router-dom";
import CatalogShell from "../components/catalog/CatalogShell";
import ContactLinks from "../components/catalog/ContactLinks";

export default function CatalogLandingPage() {
  return (
    <CatalogShell>
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(196,164,95,.22),transparent_28%),radial-gradient(circle_at_82%_62%,rgba(255,255,255,.08),transparent_24%),linear-gradient(135deg,#111210_0%,#080909_62%,#14120d_100%)]" />
        <section className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_.82fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#c4a45f]">Alternative Time Co.</p>
            <h1 className="mt-6 max-w-3xl font-brand text-5xl leading-[.92] text-white sm:text-7xl lg:text-8xl">
              Relojes con historia, seleccionados con intención.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#aaa69d] sm:text-lg">
              Curaduría de relojes vintage y piezas especiales para coleccionistas, entusiastas y personas que buscan algo con carácter propio.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#c9a85f] px-7 py-3 text-sm font-semibold text-[#16130f] transition hover:bg-[#dfc075]"
                to="/catalogo"
              >
                Ver catálogo
              </Link>
              <ContactLinks compact />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-[#171814] shadow-[0_40px_120px_rgba(0,0,0,.38)]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_50%_34%,rgba(212,184,116,.35),transparent_18%),radial-gradient(circle_at_50%_50%,#303126_0%,#10110f_56%,#090a09_100%)]" />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-3xl border border-[#c4a45f]/25 bg-black/35 p-5 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#b99a59]">Piezas únicas</p>
              <p className="mt-2 text-sm text-[#d7d0c4]">Disponibilidad directa desde inventario.</p>
            </div>
          </div>
        </section>
      </main>
    </CatalogShell>
  );
}
