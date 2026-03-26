import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: "devadmin",
    password: "DevAdmin123!"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    <section className="grid overflow-hidden rounded-[22px] border border-[#d9ccb8] bg-[#fbf7f0] lg:grid-cols-[1.25fr_0.75fr]">
      <div className="flex min-h-[620px] flex-col items-center justify-center bg-[#211b16] px-8 py-12 text-center">
        <p className="font-serif text-5xl font-semibold leading-tight text-[#d7ae57]">
          Alternative
          <br />
          Time Co.
        </p>
        <p className="mt-5 text-[11px] uppercase tracking-[0.38em] text-[#7d6a53]">
          Vintage · Classic · Timeless
        </p>
        <div className="mt-10 h-px w-44 bg-[#6a5431]" />
        <p className="mt-6 text-sm italic text-[#82715d]">
          Sistema de Punto de Venta
        </p>
      </div>

      <div className="flex items-center bg-[#f8f3eb] px-8 py-10 sm:px-12">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <h2 className="font-serif text-4xl text-[#2a221b]">Bienvenido</h2>
          <p className="mt-3 text-sm text-[#a18a6d]">
            Ingresa tus credenciales para continuar.
          </p>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Usuario
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
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
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Contrasena
              </span>
              <input
                className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
                name="password"
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
                type="password"
                value={formData.password}
              />
            </label>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-md border border-[#d9b7af] bg-[#fff4f1] px-4 py-3 text-sm text-[#8f5a4f]">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="gold-button mt-6 w-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
          </button>

          <p className="mt-6 border-t border-[#ddcfba] pt-6 text-xs text-[#a18a6d]">
            Dev login sugerido: devadmin / DevAdmin123!
          </p>
        </form>
      </div>
    </section>
  );
}
