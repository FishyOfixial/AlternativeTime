import { layawayStatusOptions } from "../../constants/layaways";

export default function LayawayFilters({ filters, clients, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#eadfcd] px-4 py-4">
      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        name="status"
        onChange={onChange}
        value={filters.status}
      >
        {layawayStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        name="customer"
        onChange={onChange}
        value={filters.customer}
      >
        <option value="">Todos los clientes</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
      <input
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        name="date_from"
        onChange={onChange}
        type="date"
        value={filters.date_from}
      />
      <input
        className="rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3 text-sm"
        name="date_to"
        onChange={onChange}
        type="date"
        value={filters.date_to}
      />
    </div>
  );
}
