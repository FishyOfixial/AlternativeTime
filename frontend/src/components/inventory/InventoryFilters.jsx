export default function InventoryFilters({
  searchTerm,
  onSearchChange,
  brands,
  selectedBrand,
  onBrandChange,
  selectedPrice,
  onPriceChange,
  selectedDays,
  onDaysChange
}) {
  return (
    <section className="flex flex-wrap gap-3">
      <input
        className="min-w-[230px] flex-1 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por ID, marca, modelo..."
        type="search"
        value={searchTerm}
      />
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
      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        onChange={(event) => onPriceChange(event.target.value)}
        value={selectedPrice}
      >
        <option value="all">Todos los precios</option>
        <option value="low">Menos de $5,000</option>
        <option value="mid">$5,000 a $9,999</option>
        <option value="high">$10,000 o mas</option>
      </select>
      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        onChange={(event) => onDaysChange(event.target.value)}
        value={selectedDays}
      >
        <option value="all">Dias en inventario</option>
        <option value="fresh">0 a 30 dias</option>
        <option value="steady">31 a 90 dias</option>
        <option value="aged">90+ dias</option>
      </select>
    </section>
  );
}
