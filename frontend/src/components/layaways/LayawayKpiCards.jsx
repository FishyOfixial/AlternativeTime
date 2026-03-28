import { formatCurrency } from "../../utils/finance";

export default function LayawayKpiCards({ kpis }) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Activos</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{kpis.active}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Completados</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{kpis.completed}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Vencidos</p>
        <p className="mt-2 font-serif text-[36px] text-[#a55b4f]">{kpis.overdue}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Saldo pendiente</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{formatCurrency(kpis.pendingBalance)}</p>
      </article>
    </section>
  );
}
