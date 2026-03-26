import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";
import ClientDetailPage from "../pages/ClientDetailPage";
import ClientsPage from "../pages/ClientsPage";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import PublicLayout from "../layouts/PublicLayout";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import InventoryFormPage from "../pages/InventoryFormPage";
import InventoryPage from "../pages/InventoryPage";
import LoginPage from "../pages/LoginPage";
import ModulePage from "../pages/ModulePage";

const modulePages = [
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/new" element={<InventoryFormPage />} />
            <Route path="/inventory/:itemId" element={<InventoryFormPage />} />
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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
