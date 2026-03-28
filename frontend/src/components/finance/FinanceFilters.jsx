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
      <div className="flex w-full flex-wrap gap-2 rounded-xl bg-[#f1ebdf] p-1 sm:w-auto">
        {rangeOptions.map((option) => (
          <button
            key={option.value}
            className={`flex-1 rounded-lg px-4 py-2 text-sm transition sm:flex-none ${
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
          className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm sm:w-auto"
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
        className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm sm:w-auto"
        onChange={(event) => onFilterTypeChange(event.target.value)}
        value={filterType}
      >
        <option value="all">Todos los tipos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Egresos</option>
      </select>
      <select
        className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm sm:w-auto"
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
