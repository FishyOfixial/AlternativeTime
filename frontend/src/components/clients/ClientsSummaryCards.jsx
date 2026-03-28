export default function ClientsSummaryCards({ total, active, recurring }) {
  return (
    <section className="hidden gap-3 lg:grid lg:grid-cols-3">
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Clientes registrados</p>
        <p className="mt-1 font-serif text-[24px] text-[#2a221b]">{total}</p>
      </article>
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Clientes activos</p>
        <p className="mt-1 font-serif text-[24px] text-[#2a221b]">{active}</p>
      </article>
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Clientes recurrentes</p>
        <p className="mt-1 font-serif text-[24px] text-[#2a221b]">{recurring}</p>
        <p className="mt-1 text-xs text-[#b09a7e]">con 2+ compras</p>
      </article>
    </section>
  );
}
