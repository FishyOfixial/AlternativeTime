export default function SalesFilters({
  searchTerm,
  onSearchChange,
  monthOptions,
  selectedMonth,
  onMonthChange,
  channelLabels,
  selectedChannel,
  onChannelChange,
  paymentLabels,
  selectedMethod,
  onMethodChange,
  brands,
  selectedBrand,
  onBrandChange
}) {
  return (
    <section className="space-y-2">
      <input
        className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm sm:min-w-[230px] sm:px-4 sm:py-3"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar cliente, ID reloj..."
        type="search"
        value={searchTerm}
      />

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        <select
          className="min-w-[130px] rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm sm:w-auto sm:px-4 sm:py-3"
          onChange={(event) => onMonthChange(event.target.value)}
          value={selectedMonth}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="min-w-[130px] rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm sm:w-auto sm:px-4 sm:py-3"
          onChange={(event) => onChannelChange(event.target.value)}
          value={selectedChannel}
        >
          <option value="all">Todos los canales</option>
          {Object.entries(channelLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="min-w-[130px] rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm sm:w-auto sm:px-4 sm:py-3"
          onChange={(event) => onMethodChange(event.target.value)}
          value={selectedMethod}
        >
          <option value="all">Todos los metodos</option>
          {Object.entries(paymentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="min-w-[130px] rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm sm:w-auto sm:px-4 sm:py-3"
          onChange={(event) => onBrandChange(event.target.value)}
          value={selectedBrand}
        >
          <option value="all">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
