import { layawayStatusLabels } from "../../constants/layaways";
import { formatCurrency } from "../../utils/finance";

export default function LayawaySummaryCards({ layaway }) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Estado</p>
        <p className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-[28px]">
          {layawayStatusLabels[layaway.status] || layaway.status}
        </p>
      </article>
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Precio acordado</p>
        <p className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-[28px]">{formatCurrency(layaway.agreed_price)}</p>
      </article>
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Abonado</p>
        <p className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-[28px]">{formatCurrency(layaway.amount_paid)}</p>
      </article>
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Saldo pendiente</p>
        <p className="mt-2 font-serif text-2xl text-[#a55b4f] sm:text-[28px]">{formatCurrency(layaway.balance_due)}</p>
      </article>
    </section>
  );
}
