import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", sprint: "S3" },
  { to: "/clients", label: "Clientes", sprint: "S4" },
  { to: "/inventory", label: "Inventario", sprint: "S5" },
  { to: "/sales", label: "Ventas", sprint: "S6" },
  { to: "/finance", label: "Finanzas", sprint: "S7" },
  { to: "/reports", label: "Reportes", sprint: "S7" },
  { to: "/users", label: "Usuarios", sprint: "S8" }
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden min-h-screen w-[260px] shrink-0 border-r border-[#3c3023] bg-[#211b16] lg:flex lg:flex-col">
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

      <div className="border-t border-b border-[#34291d] px-7 py-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#6f5c49]">
          Navegacion
        </p>
        <nav className="mt-5 flex flex-col gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <span>{link.label}</span>
              <span className="rounded-full border border-[#4a3d2e] px-2 py-1 text-[11px] text-[#8f7b63]">
                {link.sprint}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-7 py-7 text-sm text-[#8f7b63]">
        <p className="font-semibold text-[#d8cab6]">
          {user?.first_name || user?.username || "Admin"}
        </p>
        <p className="mt-1 text-xs">{user?.email || "Sesion activa"}</p>
      </div>
    </aside>
  );
}
