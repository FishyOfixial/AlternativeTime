export default function SalesSummaryCards({ summary, formatCurrency }) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <article className="stat-card p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-sm sm:tracking-[0.16em]">
          Ventas del periodo
        </p>
        <p className="mt-1 font-serif text-[22px] text-[#2a221b] sm:mt-2 sm:text-[34px]">
          {formatCurrency(summary.revenue)}
        </p>
      </article>
      <article className="stat-card p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-sm sm:tracking-[0.16em]">
          Ganancia
        </p>
        <p className="mt-1 font-serif text-[22px] text-[#5f8f66] sm:mt-2 sm:text-[34px]">
          {formatCurrency(summary.profit)}
        </p>
      </article>
      <article className="stat-card p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-sm sm:tracking-[0.16em]">
          Transacciones
        </p>
        <p className="mt-1 font-serif text-[22px] text-[#2a221b] sm:mt-2 sm:text-[34px]">{summary.count}</p>
      </article>
      <article className="stat-card p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-sm sm:tracking-[0.16em]">
          Ticket promedio
        </p>
        <p className="mt-1 font-serif text-[22px] text-[#2a221b] sm:mt-2 sm:text-[34px]">
          {formatCurrency(summary.ticket)}
        </p>
      </article>
    </section>
  );
}
