export default function FinanceSummaryCards({ kpis, formatCurrency }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Ingresos</p>
        <p className="mt-2 font-serif text-[28px] text-[#2a221b] sm:text-[32px]">
          {formatCurrency(kpis.total_income)}
        </p>
        <p className="mt-2 text-xs text-[#8a775f]">Movimientos de ingreso</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Egresos</p>
        <p className="mt-2 font-serif text-[28px] text-[#a55b4f] sm:text-[32px]">
          {formatCurrency(kpis.total_expense)}
        </p>
        <p className="mt-2 text-xs text-[#8a775f]">Movimientos de egreso</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Balance neto</p>
        <p className="mt-2 font-serif text-[28px] text-[#2a221b] sm:text-[32px]">
          {formatCurrency(kpis.net_balance)}
        </p>
        <p className="mt-2 text-xs text-[#8a775f]">Ingresos - egresos</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Ventas totales</p>
        <p className="mt-2 font-serif text-[28px] text-[#2a221b] sm:text-[32px]">
          {kpis.total_sales_count}
        </p>
        <p className="mt-2 text-xs text-[#8a775f]">Transacciones acumuladas</p>
      </article>
    </section>
  );
}
