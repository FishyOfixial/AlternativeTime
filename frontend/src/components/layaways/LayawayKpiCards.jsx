import { formatCurrency } from "../../utils/finance";

export default function LayawayKpiCards({ kpis }) {
  return (
    <section className="hidden gap-3 lg:grid lg:grid-cols-4">
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Activos</p>
        <p className="mt-1 font-serif text-[24px] text-[#2a221b]">{kpis.active}</p>
      </article>
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Completados</p>
        <p className="mt-1 font-serif text-[24px] text-[#2a221b]">{kpis.completed}</p>
      </article>
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Vencidos</p>
        <p className="mt-1 font-serif text-[24px] text-[#a55b4f]">{kpis.overdue}</p>
      </article>
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Saldo pendiente</p>
        <p className="mt-1 font-serif text-[24px] text-[#2a221b]">{formatCurrency(kpis.pendingBalance)}</p>
      </article>
    </section>
  );
}
