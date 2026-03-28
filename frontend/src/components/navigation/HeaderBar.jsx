import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { USERS_MODULE_ENABLED } from "../../constants/features";

const titles = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/inventory": "Inventario",
  "/sales": "Ventas",
  "/layaways": "Apartados",
  "/finance": "Finanzas & Flujo de Efectivo",
  "/reports": "Reportes",
  ...(USERS_MODULE_ENABLED ? { "/users": "Usuarios" } : {})
};

export default function HeaderBar({ onMenuClick }) {
  const location = useLocation();

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/layaways/")) {
      return "Detalle de apartado";
    }
    return titles[location.pathname] ?? "Alternative Time";
  }, [location.pathname]);

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat("es-MX", {
      month: "short",
      year: "numeric"
    }).format(new Date());
  }, []);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-[#dacdb8] bg-[#fbf7f0] px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Abrir menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#ddcfba] bg-[#fffdf9] text-[#7d6751] lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </button>
        <h2 className="truncate font-serif text-2xl leading-none text-[#2a221b] sm:text-[30px]">{pageTitle}</h2>
      </div>

      <div className="hidden items-center gap-4 text-sm text-[#7d6751] sm:flex">
        <div className="rounded-md border border-[#ddcfba] bg-[#fcf8f2] px-3 py-2 text-xs capitalize sm:text-sm">
          {currentDate}
        </div>
      </div>
    </header>
  );
}
