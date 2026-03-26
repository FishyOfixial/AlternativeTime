import EmptyState from "../components/feedback/EmptyState";

export default function LoginPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="panel-surface p-8 sm:p-10">
        <p className="eyebrow">Sprint Frontend 2</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Login placeholder con layout publico listo.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Esta pantalla ya tiene su ruta y su lugar definitivo en la aplicacion.
          En el siguiente sprint conectaremos JWT, `auth/me`, refresh y guards
          de ruta sobre esta base.
        </p>
      </div>

      <div className="panel-soft p-6">
        <EmptyState
          title="Formulario real pendiente"
          message="La UI ya separo la zona publica de la autenticada. Aqui entrara el formulario real de login en el Sprint Frontend 2."
        />
      </div>
    </section>
  );
}
