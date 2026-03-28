export default function AccountBalances({ accountCards, balancesMap, balanceNote, formatCurrency }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="eyebrow">Saldo por cuenta</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {accountCards.map((card) => (
          <article key={card.key} className="stat-card">
            <p className="text-xs uppercase tracking-[0.16em] text-[#c2b29a]">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-[26px] text-[#2a221b] sm:text-[30px]">
              {balancesMap[card.key] ? formatCurrency(balancesMap[card.key]) : "-"}
            </p>
            <p className="mt-1 text-xs text-[#b09a7e]">
              {balancesMap[card.key] ? "Balance actualizado" : balanceNote}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
