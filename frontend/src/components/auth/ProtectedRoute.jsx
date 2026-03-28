import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingState from "../feedback/LoadingState";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <LoadingState
            title="Restaurando sesion"
            message="Estamos validando tu acceso antes de entrar al sistema."
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
