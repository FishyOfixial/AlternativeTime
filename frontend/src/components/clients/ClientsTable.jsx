import { NavLink } from "react-router-dom";

export default function ClientsTable({
  clients,
  getClientInitials,
  formatCurrency,
  formatLastPurchase
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse bg-[#fffdf9] text-left">
        <thead className="border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Telefono</th>
            <th className="px-4 py-3">Instagram</th>
            <th className="px-4 py-3">Compras</th>
            <th className="px-4 py-3">Total gastado</th>
            <th className="px-4 py-3">Ultima compra</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
              <td className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d6ccb8] bg-[#f3efe6] font-semibold text-[#9e834d]">
                    {getClientInitials(client.name)}
                  </div>
                  <div>
                    <p className="font-medium text-[#2a221b]">{client.name}</p>
                    {client.purchases_count >= 2 ? (
                      <span className="mt-1 inline-flex rounded-full bg-[#f6ebc9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c19b4d]">
                        VIP
                      </span>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">{client.phone}</td>
              <td className="px-4 py-4">{client.instagram_handle || "-"}</td>
              <td className="px-4 py-4">{client.purchases_count}</td>
              <td className="px-4 py-4 font-semibold text-[#6ca07e]">
                {formatCurrency(client.total_spent)}
              </td>
              <td className="px-4 py-4">{formatLastPurchase(client.last_purchase_at)}</td>
              <td className="px-4 py-4">
                <NavLink
                  className="rounded-full border border-[#ddcfba] px-3 py-2 text-xs text-[#7d6751] transition hover:bg-[#f3ecde]"
                  to={`/clients/${client.id}`}
                >
                  Ver perfil
                </NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
