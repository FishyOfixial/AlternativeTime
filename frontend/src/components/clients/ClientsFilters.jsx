export default function ClientsFilters({ searchTerm, onSearchChange, filter, onFilterChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#eadfcd] px-4 py-4">
      <input
        className="min-w-[280px] flex-1 rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por nombre o telefono..."
        type="search"
        value={searchTerm}
      />

      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]"
        onChange={(event) => onFilterChange(event.target.value)}
        value={filter}
      >
        <option value="all">Todos los clientes</option>
        <option value="active">Clientes activos</option>
        <option value="recurring">Clientes recurrentes</option>
      </select>
    </div>
  );
}
