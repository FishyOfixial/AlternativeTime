import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { USERS_MODULE_ENABLED } from "../../constants/features";

const titles = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/inventory": "Inventario",
  "/sales": "Ventas",
  "/layaways": "Apartados",
  "/finance": "Finanzas",
  "/reports": "Reportes",
  ...(USERS_MODULE_ENABLED ? { "/users": "Usuarios" } : {})
};

export default function HeaderBar() {
  const location = useLocation();
  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/layaways/")) {
      return "Detalle de apartado";
    }
    return titles[location.pathname] ?? "Alternative Time";
  }, [location.pathname]);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#dacdb8] bg-[#fbf7f0] px-6 py-4 sm:px-8">
      <div>
        <h2 className="mt-1 font-serif text-[30px] leading-none text-[#2a221b]">
          {pageTitle}
        </h2>
      </div>
      <div className="flex items-center gap-4 text-sm text-[#7d6751]">
        <div className="rounded-md border border-[#ddcfba] bg-[#fcf8f2] px-3 py-2">
          Marzo 2026
        </div>
      </div>
    </header>
  );
}
