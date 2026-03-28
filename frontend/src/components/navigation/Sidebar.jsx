import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { USERS_MODULE_ENABLED } from "../../constants/features";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clientes"},
  { to: "/inventory", label: "Inventario"},
  { to: "/sales", label: "Ventas"},
  { to: "/layaways", label: "Apartados"},
  { to: "/finance", label: "Finanzas"},
  { to: "/reports", label: "Reportes"},
  { to: "/users", label: "Usuarios", enabled: USERS_MODULE_ENABLED }
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="hidden h-screen w-[var(--sidebar-width)] shrink-0 border-r border-[#3c3023] bg-[#211b16] lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="px-7 pb-6 pt-7">
        <p className="font-serif text-2xl font-semibold leading-tight text-[#d9b35f]">
          Alternative
          <br />
          Time Co.
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#8f7a61]">
          Vintage · Classic · Timeless
        </p>
      </div>

      <div className="flex-1 border-y border-[#34291d] px-7 py-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#6f5c49]">
          Navegacion
        </p>
        <nav className="mt-5 flex flex-col gap-2">
          {links.filter((link) => link.enabled !== false).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-7 py-7 text-sm text-[#8f7b63]">
        <p className="font-semibold text-[#d8cab6]">
          {user?.first_name || user?.username || "Admin"}
        </p>
        <p className="mt-1 text-xs">{user?.email || "Sesion activa"}</p>
        <button
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[#4a3d2e] bg-[#2a2119] px-4 py-3 text-sm font-semibold text-[#e2ba63] transition hover:bg-[#34291f] hover:text-[#f5d07a]"
          onClick={logout}
          type="button"
        >
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
