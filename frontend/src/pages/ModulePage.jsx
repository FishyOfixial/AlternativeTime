import EmptyState from "../components/feedback/EmptyState";

export default function ModulePage({ eyebrow, title, description }) {
  return (
    <div className="space-y-6">
      <section>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#2a221b]">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#736350]">
          {description}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
            Ruta
          </p>
          <p className="mt-3 font-serif text-[34px] text-[#2a221b]">Lista</p>
        </div>
        <div className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
            Layout
          </p>
          <p className="mt-3 font-serif text-[34px] text-[#2a221b]">Listo</p>
        </div>
        <div className="stat-card">
          <p className="text-sm uppercase tracking-[0.16em] text-[#b5a18a]">
            Servicios
          </p>
          <p className="mt-3 font-serif text-[34px] text-[#2a221b]">
            Preparados
          </p>
        </div>
      </div>

      <EmptyState
        title={`Modulo ${title} pendiente de implementacion`}
        message="Sprint 1 deja la estructura y la navegacion resueltas para que el modulo se construya en su sprint correspondiente."
      />
    </div>
  );
}
