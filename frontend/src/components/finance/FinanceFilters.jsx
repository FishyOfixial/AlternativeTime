const selectClassName =
  "w-full rounded-xl border border-[#dccfb9] bg-[#fffdf9] px-4 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

export default function FinanceFilters({
  rangeOptions,
  selectedRange,
  onRangeChange,
  selectedYear,
  availableYears,
  onYearChange,
  filterType,
  onFilterTypeChange,
  filterAccount,
  onFilterAccountChange,
  accountCards
}) {
  return (
    <section className="rounded-[24px] border border-[#eadfcd] bg-[#fffdf9] p-4 shadow-[0_20px_45px_-36px_rgba(56,42,29,0.35)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1 xl:max-w-none">
          <p className="eyebrow">Filtros</p>
          <div className="mt-3 flex w-full overflow-x-auto rounded-2xl bg-[#f3ecdf] p-1.5 xl:grid xl:grid-cols-5 xl:overflow-visible">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                className={`shrink-0 rounded-xl px-3 py-2 text-sm transition xl:w-full ${
                  selectedRange === option.value
                    ? "bg-[#fffdf9] text-[#2a221b] shadow-sm"
                    : "text-[#9a886f] hover:text-[#6f5d49]"
                }`}
                onClick={() => onRangeChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto xl:min-w-[520px]">
          {selectedRange === "year" ? (
            <label className="block min-w-[140px] shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#b09a7e]">Año</span>
              <select
                className={`${selectClassName} mt-1.5`}
                onChange={(event) => onYearChange(Number(event.target.value))}
                value={selectedYear}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="hidden xl:block xl:min-w-[140px]" />
          )}

          <label className="block min-w-[160px] shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#b09a7e]">Tipo</span>
            <select
              className={`${selectClassName} mt-1.5`}
              onChange={(event) => onFilterTypeChange(event.target.value)}
              value={filterType}
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Egresos</option>
            </select>
          </label>

          <label className="block min-w-[180px] shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#b09a7e]">Cuenta</span>
            <select
              className={`${selectClassName} mt-1.5`}
              onChange={(event) => onFilterAccountChange(event.target.value)}
              value={filterAccount}
            >
              <option value="all">Todas las cuentas</option>
              {accountCards.map((card) => (
                <option key={card.key} value={card.key}>
                  {card.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
