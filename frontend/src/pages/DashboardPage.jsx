import EmptyState from "../components/feedback/EmptyState";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="eyebrow">Sprint Frontend 3</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Dashboard base dentro de la shell autenticada.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Esta vista ya vive dentro del layout privado y sirve para validar la
          navegacion interna antes de integrar el dashboard real.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {["Resumen general", "Accesos rapidos", "Widgets KPI"].map((title) => (
          <div key={title} className="panel-soft p-5">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-3 text-xl font-semibold text-white">Base lista</p>
          </div>
        ))}
      </section>

      <EmptyState
        title="Dashboard funcional pendiente"
        message="Sprint 1 deja resuelta la arquitectura. Sprint 3 conectara esta vista con metricas y accesos operativos."
      />
    </div>
  );
}
