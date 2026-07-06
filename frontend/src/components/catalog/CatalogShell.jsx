import { Link } from "react-router-dom";
import ContactLinks from "./ContactLinks";

export default function CatalogShell({ children }) {
  return (
    <div className="min-h-screen bg-[#0d0e0e] text-[#f4f0e8]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0e0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link className="group" to="/catalog">
            <span className="block text-[10px] uppercase tracking-[0.45em] text-[#b99a59]">Alternative</span>
            <span className="font-brand text-xl tracking-[0.12em] text-white">TIME CO.</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link className="text-sm text-[#d7d0c4] transition hover:text-white" to="/catalog">
              Colección
            </Link>
            <div className="hidden sm:block"><ContactLinks compact /></div>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#b99a59]">Alternative Time Co.</p>
            <p className="mt-2 max-w-md text-sm text-[#8f8c85]">Relojes seleccionados con carácter, historia y precisión.</p>
          </div>
          <ContactLinks compact />
        </div>
      </footer>
    </div>
  );
}
