export default function ClientsSummaryCards({ total, active, recurring }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Clientes registrados</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{total}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Clientes activos</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{active}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Clientes recurrentes</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{recurring}</p>
        <p className="mt-1 text-xs text-[#b09a7e]">con 2+ compras</p>
      </article>
    </section>
  );
}
