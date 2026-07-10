import { useState } from "react";
import { Link } from "react-router-dom";
import ContactLinks from "./ContactLinks";
import FaqModal from "./FaqModal";
import PoliciesModal from "./PoliciesModal";

export default function CatalogShell({ children }) {
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0e0e] text-[#f4f0e8]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0e0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link className="group" to="/">
            <span className="block font-brand text-2xl leading-tight text-[#d9b35f] transition group-hover:text-[#f0cd84]">
              Alternative
              <br />
              Time Co.
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link className="text-sm text-[#d7d0c4] transition hover:text-white" to="/catalogo">
              Colección
            </Link>
            <div className="hidden sm:block"><ContactLinks compact /></div>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-brand text-2xl leading-tight text-[#d9b35f]">
              Alternative
              <br />
              Time Co.
            </p>
            <p className="mt-2 max-w-md text-sm text-[#8f8c85]">
              Relojes seleccionados con carácter, historia y precisión.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <button
              className="text-left text-xs uppercase tracking-[0.2em] text-[#a99a7c] underline decoration-white/20 underline-offset-4 transition hover:text-white sm:text-right"
              onClick={() => setIsPoliciesOpen(true)}
              type="button"
            >
              Políticas
            </button>
            <button
              className="text-left text-xs uppercase tracking-[0.2em] text-[#a99a7c] underline decoration-white/20 underline-offset-4 transition hover:text-white sm:text-right"
              onClick={() => setIsFaqOpen(true)}
              type="button"
            >
              FAQ
            </button>
            <ContactLinks compact />
          </div>
        </div>
      </footer>
      <PoliciesModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} />
      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </div>
  );
}
