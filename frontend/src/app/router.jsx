import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import PublicLayout from "../layouts/PublicLayout";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ModulePage from "../pages/ModulePage";

const modulePages = [
  {
    path: "/clients",
    title: "Clientes",
    eyebrow: "Sprint Frontend 4",
    description:
      "Modulo preparado para incorporar listado, detalle y formularios CRUD de clientes."
  },
  {
    path: "/inventory",
    title: "Inventario",
    eyebrow: "Sprint Frontend 5",
    description:
      "Base lista para crecer hacia catalogo, detalle y formularios del inventario."
  },
  {
    path: "/sales",
    title: "Ventas",
    eyebrow: "Sprint Frontend 6",
    description:
      "Pantalla placeholder para capturar ventas e integrar clientes e inventario."
  },
  {
    path: "/finance",
    title: "Finanzas",
    eyebrow: "Sprint Frontend 7",
    description:
      "Espacio reservado para resumenes financieros y metricas consolidadas."
  },
  {
    path: "/reports",
    title: "Reportes",
    eyebrow: "Sprint Frontend 7",
    description:
      "Vista base para reportes agregados y consultas administrativas."
  },
  {
    path: "/users",
    title: "Usuarios",
    eyebrow: "Sprint Frontend 8",
    description:
      "Pantalla preparada para gestion de usuarios y futuras capacidades por rol."
  }
];

function RouteIndex() {
  return (
    <div className="flex flex-wrap gap-3">
      {[...modulePages, { path: "/dashboard", title: "Dashboard" }].map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
        >
          Abrir {item.title}
        </NavLink>
      ))}
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage footerSlot={<RouteIndex />} />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {modulePages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={
                <ModulePage
                  eyebrow={page.eyebrow}
                  title={page.title}
                  description={page.description}
                />
              }
            />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
