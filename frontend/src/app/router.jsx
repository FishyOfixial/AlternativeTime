import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import { USERS_MODULE_ENABLED } from "../constants/features";

const ClientDetailPage = lazy(() => import("../pages/ClientDetailPage"));
const ClientsPage = lazy(() => import("../pages/ClientsPage"));
const CatalogDetailPage = lazy(() => import("../pages/CatalogDetailPage"));
const CatalogLandingPage = lazy(() => import("../pages/CatalogLandingPage"));
const CatalogPage = lazy(() => import("../pages/CatalogPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const FinancePage = lazy(() => import("../pages/FinancePage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const InventoryFormPage = lazy(() => import("../pages/InventoryFormPage"));
const InventoryPage = lazy(() => import("../pages/InventoryPage"));
const LayawayDetailPage = lazy(() => import("../pages/LayawayDetailPage"));
const LayawaysPage = lazy(() => import("../pages/LayawaysPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ModulePage = lazy(() => import("../pages/ModulePage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const SalesFormPage = lazy(() => import("../pages/SalesFormPage"));
const SalesPage = lazy(() => import("../pages/SalesPage"));

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

function LegacyCatalogDetailRedirect() {
  const { itemId } = useParams();
  return <Navigate to={`/catalogo/${itemId}`} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-[#0d0e0e]" />}>
        <Routes>
          <Route path="/healthcheck" element={<Navigate to="/healthcheck/" replace />} />
          <Route path="/healthcheck/" element={<HomePage />} />
          <Route path="/" element={<CatalogLandingPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/catalogo/:itemId" element={<CatalogDetailPage />} />
          <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />
          <Route path="/catalog/:itemId" element={<LegacyCatalogDetailRedirect />} />

          <Route element={<PublicOnlyRoute />}>
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
              <Route path="/sales/:saleId/edit" element={<SalesFormPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
