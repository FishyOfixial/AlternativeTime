import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";

const AuthenticatedAppRoutes = lazy(() => import("./AuthenticatedAppRoutes"));
const CatalogDetailPage = lazy(() => import("../pages/CatalogDetailPage"));
const CatalogLandingPage = lazy(() => import("../pages/CatalogLandingPage"));
const CatalogPage = lazy(() => import("../pages/CatalogPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));

function LegacyCatalogDetailRedirect() {
  const { itemId } = useParams();
  return <Navigate to={`/catalogo/${itemId}`} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-[#0d0e0e]" />}>
        <Routes>
          <Route path="/" element={<CatalogLandingPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/catalogo/:itemId" element={<CatalogDetailPage />} />
          <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />
          <Route path="/catalog/:itemId" element={<LegacyCatalogDetailRedirect />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route path="*" element={<AuthenticatedAppRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
