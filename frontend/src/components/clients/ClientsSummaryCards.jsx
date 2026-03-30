export default function ClientsSummaryCards({ total, active, recurring }) {
  return (
    <section className="hidden gap-3 lg:grid lg:grid-cols-3">
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-2">
        <p className="text-xs uppercase tracking-[0.16em] text-[#c2b29a]">Clientes registrados</p>
        <p className="mt-1 font-serif text-[20px] text-[#2a221b]">{total}</p>
      </article>
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-2">
        <p className="text-xs uppercase tracking-[0.16em] text-[#c2b29a]">Clientes activos</p>
        <p className="mt-1 font-serif text-[20px] text-[#2a221b]">{active}</p>
      </article>
      <article className="rounded-xl border border-[#ddcfba] bg-[#fcf8f2] p-2">
        <p className="text-xs uppercase tracking-[0.16em] text-[#c2b29a]">Clientes recurrentes</p>
        <p className="mt-1 font-serif text-[20px] text-[#2a221b]">{recurring}</p>
      </article>
    </section>
  );
}
