import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "../feedback/LoadingState";
import { useAuth } from "../../contexts/AuthContext";

export default function PublicOnlyRoute() {
  const { isAuthenticated, isBooting } = useAuth();

  if (isBooting) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <LoadingState
            title="Preparando acceso"
            message="Estamos verificando si ya existe una sesion activa."
          />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
