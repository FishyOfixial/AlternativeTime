import { layawayStatusLabels } from "../../constants/layaways";
import { formatCurrency } from "../../utils/finance";

export default function LayawaySummaryCards({ layaway }) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Estado</p>
        <p className="mt-2 font-serif text-[28px] text-[#2a221b]">
          {layawayStatusLabels[layaway.status] || layaway.status}
        </p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Precio acordado</p>
        <p className="mt-2 font-serif text-[28px] text-[#2a221b]">{formatCurrency(layaway.agreed_price)}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Abonado</p>
        <p className="mt-2 font-serif text-[28px] text-[#2a221b]">{formatCurrency(layaway.amount_paid)}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Saldo pendiente</p>
        <p className="mt-2 font-serif text-[28px] text-[#a55b4f]">{formatCurrency(layaway.balance_due)}</p>
      </article>
    </section>
  );
}
