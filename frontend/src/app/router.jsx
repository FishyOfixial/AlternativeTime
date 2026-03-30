import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";
import ClientDetailPage from "../pages/ClientDetailPage";
import ClientsPage from "../pages/ClientsPage";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import InventoryFormPage from "../pages/InventoryFormPage";
import InventoryPage from "../pages/InventoryPage";
import LoginPage from "../pages/LoginPage";
import ModulePage from "../pages/ModulePage";
import FinancePage from "../pages/FinancePage";
import LayawayDetailPage from "../pages/LayawayDetailPage";
import LayawaysPage from "../pages/LayawaysPage";
import ReportsPage from "../pages/ReportsPage";
import SalesFormPage from "../pages/SalesFormPage";
import SalesPage from "../pages/SalesPage";
import { USERS_MODULE_ENABLED } from "../constants/features";

const modulePages = [
  {
    enabled: USERS_MODULE_ENABLED,
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
        <Route path="/healthcheck" element={<Navigate to="/healthcheck/" replace />} />
        <Route path="/healthcheck/" element={<HomePage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/new" element={<InventoryFormPage />} />
            <Route path="/inventory/:itemId" element={<InventoryFormPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/new" element={<SalesFormPage />} />
            <Route path="/layaways" element={<LayawaysPage />} />
            <Route path="/layaways/:layawayId" element={<LayawayDetailPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            {modulePages.filter((page) => page.enabled).map((page) => (
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
