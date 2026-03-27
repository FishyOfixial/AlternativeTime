export default function SalesSummaryCards({ summary, formatCurrency }) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
          Ventas del periodo
        </p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
          {formatCurrency(summary.revenue)}
        </p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Ganancia</p>
        <p className="mt-2 font-serif text-[36px] text-[#5f8f66]">
          {formatCurrency(summary.profit)}
        </p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
          Transacciones
        </p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{summary.count}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">
          Ticket promedio
        </p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
          {formatCurrency(summary.ticket)}
        </p>
      </article>
    </section>
  );
}
