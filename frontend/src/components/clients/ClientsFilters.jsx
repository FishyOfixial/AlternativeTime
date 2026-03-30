export default function ClientsFilters({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  onToggleCreate,
  isCreateOpen
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#eadfcd] px-4 py-4">
      <input
        className="w-full min-w-0 flex-1 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4] sm:min-w-[280px]"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por nombre o telefono..."
        type="search"
        value={searchTerm}
      />

      <select
        className="w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4] sm:w-auto"
        onChange={(event) => onFilterChange(event.target.value)}
        value={filter}
      >
        <option value="all">Todos los clientes</option>
        <option value="active">Clientes activos</option>
        <option value="recurring">Clientes recurrentes</option>
      </select>

      <button
        className="gold-button w-full px-4 py-2 text-xs sm:w-auto"
        onClick={onToggleCreate}
        type="button"
      >
        {isCreateOpen ? "Cerrar formulario" : "+ Nuevo cliente"}
      </button>
    </div>
  );
}
