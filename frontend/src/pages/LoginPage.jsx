import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PwaStatusBanner from "../components/pwa/PwaStatusBanner";
import { useAuth } from "../contexts/AuthContext";

const inputClassName =
  "mt-2 block w-full rounded-xl border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm text-[#2a221b] outline-none transition placeholder:text-[#b8aa95] focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const destination = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await login(formData);
      navigate(destination, { replace: true });
    } catch {
      setErrorMessage("No pudimos iniciar sesion. Revisa tus credenciales.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-[100dvh] items-center justify-center bg-[#f4efe5] px-4 py-6 sm:px-6">
      <div className="w-full max-w-2xl space-y-4">
        <PwaStatusBanner />

        <div className="mx-auto w-full max-w-lg rounded-[24px] border border-[#d9ccb8] bg-[#fbf7f0] p-6 shadow-[0_18px_54px_rgba(53,38,24,0.08)] sm:p-8">
          <div className="text-center">
            <p className="font-brand text-3xl leading-none text-[#2a221b] sm:text-4xl">
              Alternative Time Co.
            </p>
            <h1 className="mt-3 text-lg font-medium text-[#8a775f] sm:text-xl">
              Iniciar sesion
            </h1>
          </div>

          <form className="mx-auto mt-8 w-full max-w-md space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Usuario
              </span>
              <input
                autoComplete="username"
                className={inputClassName}
                name="username"
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    username: event.target.value
                  }))
                }
                type="text"
                value={formData.username}
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Contrasena
                </span>
                <button
                  className="text-xs font-medium text-[#8a775f] transition hover:text-[#2a221b]"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                autoComplete="current-password"
                className={inputClassName}
                name="password"
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
                type={showPassword ? "text" : "password"}
                value={formData.password}
              />
            </label>

            {errorMessage ? (
              <p className="rounded-xl border border-[#d9b7af] bg-[#fff4f1] px-4 py-3 text-sm text-[#8f5a4f]">
                {errorMessage}
              </p>
            ) : null}

            <button
              className="gold-button w-full py-3"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
