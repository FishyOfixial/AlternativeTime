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
    <section className="flex flex-wrap items-center gap-3">
      <input
        className="min-w-[230px] flex-1 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar cliente, ID reloj..."
        type="search"
        value={searchTerm}
      />
      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
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
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
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
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
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
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
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
    </section>
  );
}
