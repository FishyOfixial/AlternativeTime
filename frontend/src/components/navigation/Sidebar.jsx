import { NavLink } from "react-router-dom";

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
  return (
    <aside className="panel-surface hidden w-80 shrink-0 p-6 lg:flex lg:flex-col">
      <div>
        <p className="eyebrow">App Shell</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Alternative Time
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Sidebar base para la zona autenticada. Este sprint deja la navegacion
          y la estructura listas para los modulos reales.
        </p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            <span>{link.label}</span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">
              {link.sprint}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="panel-soft mt-6 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Estado actual</p>
        <p className="mt-2 leading-6">
          Sin auth real todavia. La shell existe para que Sprint 2 y Sprint 3
          ya trabajen sobre una base estable.
        </p>
      </div>
    </aside>
  );
}
