import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import ContactLinks from "./ContactLinks";

const FaqModal = lazy(() => import("./FaqModal"));
const PoliciesModal = lazy(() => import("./PoliciesModal"));

export default function CatalogShell({ children }) {
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#0d0e0e] text-[#f4f0e8]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0e0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link className="group" to="/">
            <span className="block font-brand text-2xl leading-tight text-[#d9b35f] transition group-hover:text-[#f0cd84]">
              Alternative
              <br className="lg:hidden" /> Time Co.
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link className="text-sm text-[#d7d0c4] transition hover:text-white" to="/catalogo">
              Colección
            </Link>
            <div className="hidden sm:block">
              <ContactLinks compact />
            </div>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col">
          <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
            <div className="flex flex-row items-start gap-5">
              <button
                className="text-xs uppercase tracking-[0.2em] text-[#a99a7c] underline decoration-white/20 underline-offset-4 transition hover:text-white"
                onClick={() => setIsPoliciesOpen(true)}
                type="button"
              >
                Políticas
              </button>
              <button
                className="text-xs uppercase tracking-[0.2em] text-[#a99a7c] underline decoration-white/20 underline-offset-4 transition hover:text-white"
                onClick={() => setIsFaqOpen(true)}
                type="button"
              >
                FAQ
              </button>
            </div>
            <div className="sm:ml-auto">
              <ContactLinks compact orientation="row" />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-[#77766f]">
            © {currentYear} Alternative Time Co. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      <Suspense fallback={null}>
        {isPoliciesOpen ? <PoliciesModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} /> : null}
        {isFaqOpen ? <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} /> : null}
      </Suspense>
    </div>
  );
}
