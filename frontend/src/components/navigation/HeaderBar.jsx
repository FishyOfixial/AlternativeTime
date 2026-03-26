import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const titles = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/inventory": "Inventario",
  "/sales": "Ventas",
  "/finance": "Finanzas",
  "/reports": "Reportes",
  "/users": "Usuarios"
};

export default function HeaderBar() {
  const location = useLocation();
  const { user } = useAuth();
  const pageTitle = useMemo(
    () => titles[location.pathname] ?? "Alternative Time",
    [location.pathname]
  );

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#dacdb8] bg-[#fbf7f0] px-6 py-4 sm:px-8">
      <div>
        <p className="eyebrow">Workspace UI</p>
        <h2 className="mt-1 font-serif text-[30px] leading-none text-[#2a221b]">
          {pageTitle}
        </h2>
      </div>
      <div className="flex items-center gap-4 text-sm text-[#7d6751]">
        <div className="rounded-md border border-[#ddcfba] bg-[#fcf8f2] px-3 py-2">
          Marzo 2026
        </div>
        <div>Hola, {user?.first_name || user?.username || "Admin"}</div>
      </div>
    </header>
  );
}
