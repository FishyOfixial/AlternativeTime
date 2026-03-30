export default function AccountBalances({ accountCards, balancesMap, balanceNote, formatCurrency }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="eyebrow">Saldo por cuenta</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {accountCards.map((card) => {
          const hasBalance = balancesMap[card.key] !== undefined && balancesMap[card.key] !== null;

          return (
            <article key={card.key} className="stat-card">
              <p className="text-xs uppercase tracking-[0.16em] text-[#c2b29a]">{card.label}</p>
              <p className="mt-1 font-serif text-[18px] text-[#2a221b] sm:text-[30px]">
                {hasBalance ? formatCurrency(balancesMap[card.key]) : "-"}
              </p>
              <p className="mt-1 text-xs text-[#b09a7e]">
                <span className="hidden sm:inline">{hasBalance ? "Saldo disponible" : balanceNote}</span>
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
