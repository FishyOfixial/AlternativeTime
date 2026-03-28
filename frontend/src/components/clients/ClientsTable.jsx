import { NavLink } from "react-router-dom";
import ResponsiveTableShell from "../common/ResponsiveTableShell";

function ClientMobileCard({ client, getClientInitials, formatCurrency, formatLastPurchase }) {
  return (
    <article className="rounded-xl border border-[#eadfcd] bg-[#fffdf9] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d6ccb8] bg-[#f3efe6] text-xs font-semibold text-[#9e834d]">
            {getClientInitials(client.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-[#2a221b]" title={client.name}>
              {client.name}
            </p>
            <p className="text-xs text-[#8a775f]">{client.phone || "Sin telefono"}</p>
          </div>
        </div>
        <NavLink
          className="rounded-full border border-[#ddcfba] px-3 py-1.5 text-[11px] text-[#7d6751] transition hover:bg-[#f3ecde]"
          to={`/clients/${client.id}`}
        >
          Ver
        </NavLink>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5d5144]">
        <p>Compras: {client.purchases_count}</p>
        <p className="font-semibold text-[#6ca07e]">{formatCurrency(client.total_spent)}</p>
        <p className="truncate" title={client.instagram_handle || "-"}>
          IG: {client.instagram_handle || "-"}
        </p>
        <p>{formatLastPurchase(client.last_purchase_at)}</p>
      </div>
    </article>
  );
}

export default function ClientsTable({
  clients,
  getClientInitials,
  formatCurrency,
  formatLastPurchase
}) {
  return (
    <ResponsiveTableShell
      bordered={false}
      mobileContent={clients.map((client) => (
        <ClientMobileCard
          key={client.id}
          client={client}
          getClientInitials={getClientInitials}
          formatCurrency={formatCurrency}
          formatLastPurchase={formatLastPurchase}
        />
      ))}
      desktopContent={
        <table className="w-full min-w-[900px] border-collapse bg-[#fffdf9] text-left lg:min-w-[980px]">
          <thead className="sticky top-0 z-10 border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="min-w-[240px] px-4 py-3">Cliente</th>
              <th className="w-[160px] px-4 py-3">Telefono</th>
              <th className="hidden w-[180px] px-4 py-3 lg:table-cell">Instagram</th>
              <th className="w-[90px] px-4 py-3">Compras</th>
              <th className="w-[150px] px-4 py-3">Total gastado</th>
              <th className="w-[150px] px-4 py-3">Ultima compra</th>
              <th className="w-[110px] px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d6ccb8] bg-[#f3efe6] font-semibold text-[#9e834d]">
                      {getClientInitials(client.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#2a221b]" title={client.name}>
                        {client.name}
                      </p>
                      {client.purchases_count >= 2 ? (
                        <span className="mt-1 inline-flex rounded-full bg-[#f6ebc9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c19b4d]">
                          VIP
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">{client.phone || "-"}</td>
                <td className="hidden px-4 py-4 lg:table-cell">
                  <p className="truncate" title={client.instagram_handle || "-"}>
                    {client.instagram_handle || "-"}
                  </p>
                </td>
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
      }
    />
  );
}
