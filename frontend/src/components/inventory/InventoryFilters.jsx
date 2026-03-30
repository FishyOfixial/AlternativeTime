import { NavLink } from "react-router-dom";

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
    <section className="panel-soft p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#eadfcd] pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d7964]">Tabla de inventario</p>
        <NavLink className="gold-button px-4 py-2 text-xs" to="/inventory/new">
          + Nuevo reloj
        </NavLink>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-[minmax(280px,1fr)_auto_auto_auto]">
        <input
          className="w-full min-w-0 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm xl:min-w-[260px]"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por ID, marca, modelo..."
          type="search"
          value={searchTerm}
        />
        <select
          className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm"
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
          className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm"
          onChange={(event) => onPriceChange(event.target.value)}
          value={selectedPrice}
        >
          <option value="all">Todos los precios</option>
          <option value="low">Menos de $5,000</option>
          <option value="mid">$5,000 a $9,999</option>
          <option value="high">$10,000 o mas</option>
        </select>
        <select
          className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm"
          onChange={(event) => onDaysChange(event.target.value)}
          value={selectedDays}
        >
          <option value="all">Dias en inventario</option>
          <option value="fresh">0 a 30 dias</option>
          <option value="steady">31 a 90 dias</option>
          <option value="aged">90+ dias</option>
        </select>
      </div>
    </section>
  );
}
