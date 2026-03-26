import EmptyState from "../components/feedback/EmptyState";

export default function ModulePage({ eyebrow, title, description }) {
  return (
    <div className="space-y-6">
      <section>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          {description}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="panel-soft p-5">
          <p className="text-sm text-slate-400">Ruta</p>
          <p className="mt-3 text-xl font-semibold text-white">Lista</p>
        </div>
        <div className="panel-soft p-5">
          <p className="text-sm text-slate-400">Layout</p>
          <p className="mt-3 text-xl font-semibold text-white">Listo</p>
        </div>
        <div className="panel-soft p-5">
          <p className="text-sm text-slate-400">Servicios</p>
          <p className="mt-3 text-xl font-semibold text-white">Preparados</p>
        </div>
      </div>

      <EmptyState
        title={`Modulo ${title} pendiente de implementacion`}
        message="Sprint 1 deja la estructura y la navegacion resueltas para que el modulo se construya en su sprint correspondiente."
      />
    </div>
  );
}
