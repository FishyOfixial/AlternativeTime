export default function FinanceSummaryCards({ kpis, formatCurrency }) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      <article className="stat-card p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-sm sm:tracking-[0.16em]">
          Balance neto
        </p>
        <p className="mt-1 font-serif text-[22px] text-[#2a221b] sm:mt-2 sm:text-[32px]">
          {formatCurrency(kpis.net_balance)}
        </p>
      </article>

      <article className="stat-card p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-sm sm:tracking-[0.16em]">
          Ingresos
        </p>
        <p className="mt-1 font-serif text-[22px] text-[#2a221b] sm:mt-2 sm:text-[32px]">
          {formatCurrency(kpis.total_income)}
        </p>
      </article>

      <article className="stat-card p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-sm sm:tracking-[0.16em]">
          Egresos
        </p>
        <p className="mt-1 font-serif text-[22px] text-[#a55b4f] sm:mt-2 sm:text-[32px]">
          {formatCurrency(kpis.total_expense)}
        </p>
      </article>
    </section>
  );
}
