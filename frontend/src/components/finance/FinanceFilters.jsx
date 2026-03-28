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
    <section className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2 rounded-xl bg-[#f1ebdf] p-1">
        {rangeOptions.map((option) => (
          <button
            key={option.value}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              selectedRange === option.value
                ? "bg-[#fffdf9] text-[#2a221b] shadow-sm"
                : "text-[#9a886f]"
            }`}
            onClick={() => onRangeChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      {selectedRange === "year" ? (
        <select
          className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
          onChange={(event) => onYearChange(Number(event.target.value))}
          value={selectedYear}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      ) : null}
      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        onChange={(event) => onFilterTypeChange(event.target.value)}
        value={filterType}
      >
        <option value="all">Todos los tipos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Egresos</option>
      </select>
      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
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
    </section>
  );
}
