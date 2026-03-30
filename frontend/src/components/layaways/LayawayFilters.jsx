import { layawayStatusOptions, layawayViewOptions } from "../../constants/layaways";

const fieldClassName =
  "w-full rounded-lg border border-[#dccfb9] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#2a221b] outline-none transition focus:border-[#b69556] focus:ring-2 focus:ring-[#ead9b4]";

export default function LayawayFilters({ filters, clients, onChange }) {
  return (
    <div className="border-b border-[#eadfcd] px-4 py-4 sm:px-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
            Buscar apartado
          </span>
          <input
            className={`${fieldClassName} mt-1.5`}
            name="query"
            onChange={onChange}
            placeholder="Cliente, reloj o codigo"
            value={filters.query}
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
            Vista rapida
          </span>
          <select className={`${fieldClassName} mt-1.5`} name="view" onChange={onChange} value={filters.view}>
            {layawayViewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
            Estado
          </span>
          <select className={`${fieldClassName} mt-1.5`} name="status" onChange={onChange} value={filters.status}>
            {layawayStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b09a7e]">
            Cliente
          </span>
          <select className={`${fieldClassName} mt-1.5`} name="customer" onChange={onChange} value={filters.customer}>
            <option value="">Todos los clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
