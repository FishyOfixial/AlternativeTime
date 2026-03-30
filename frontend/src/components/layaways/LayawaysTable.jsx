import { NavLink } from "react-router-dom";
import { layawayStatusLabels } from "../../constants/layaways";
import { formatCurrency } from "../../utils/finance";

function getStatusStyles(layaway) {
  if (layaway.product_status === "sold" || layaway.status === "completed") {
    return "bg-[#e8f4e8] text-[#4e8a5f]";
  }
  if (layaway.is_overdue) {
    return "bg-[#fff1ee] text-[#a55b4f]";
  }
  return "bg-[#f6ebc9] text-[#a17831]";
}

function statusLabel(layaway) {
  return layaway.is_overdue ? "Vencido" : layawayStatusLabels[layaway.status] || layaway.status;
}

export default function LayawaysTable({ layaways }) {
  return (
    <>
      <div className="space-y-3 p-4 sm:hidden">
        {layaways.map((layaway) => (
          <article key={layaway.id} className="rounded-2xl border border-[#eadfcd] bg-[#fffdf9] p-3 shadow-[0_18px_40px_-32px_rgba(56,42,29,0.45)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="line-clamp-1 text-[13px] font-semibold text-[#2a221b]">
                  {layaway.product_code} · {layaway.product_label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#8a775f]">
                  {layaway.client_name || layaway.customer_name || "Sin cliente"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${getStatusStyles(layaway)}`}
              >
                {statusLabel(layaway)}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl bg-[#fcf8f2] px-2.5 py-2">
                <dt className="uppercase tracking-[0.08em] text-[#b09a7e]">Inicio</dt>
                <dd className="mt-0.5 font-semibold text-[#2a221b]">{layaway.start_date}</dd>
              </div>
              <div className="rounded-xl bg-[#fcf8f2] px-2.5 py-2">
                <dt className="uppercase tracking-[0.08em] text-[#b09a7e]">Saldo</dt>
                <dd className="mt-0.5 font-semibold text-[#a55b4f]">{formatCurrency(layaway.balance_due)}</dd>
              </div>
              <div className="rounded-xl bg-[#fcf8f2] px-2.5 py-2">
                <dt className="uppercase tracking-[0.08em] text-[#b09a7e]">Acordado</dt>
                <dd className="mt-0.5 font-semibold text-[#2a221b]">{formatCurrency(layaway.agreed_price)}</dd>
              </div>
              <div className="rounded-xl bg-[#fcf8f2] px-2.5 py-2">
                <dt className="uppercase tracking-[0.08em] text-[#b09a7e]">Abonado</dt>
                <dd className="mt-0.5 font-semibold text-[#2a221b]">{formatCurrency(layaway.amount_paid)}</dd>
              </div>
            </dl>

            <NavLink
              className="mt-3 inline-flex rounded-full border border-[#ddcfba] px-3 py-1.5 text-[11px] text-[#7d6751] transition hover:bg-[#f3ecde]"
              to={`/layaways/${layaway.id}`}
            >
              Ver detalle
            </NavLink>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full border-collapse bg-[#fffdf9] text-left">
          <thead className="border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Reloj</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Abonado</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {layaways.map((layaway) => (
              <tr key={layaway.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                <td className="px-4 py-4">{layaway.start_date}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-[#2a221b]">{layaway.product_label}</p>
                  <p className="text-xs text-[#8a775f]">{layaway.product_code}</p>
                </td>
                <td className="px-4 py-4">{layaway.client_name || layaway.customer_name || "Sin nombre"}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getStatusStyles(layaway)}`}
                  >
                    {statusLabel(layaway)}
                  </span>
                </td>
                <td className="px-4 py-4">{formatCurrency(layaway.agreed_price)}</td>
                <td className="px-4 py-4">{formatCurrency(layaway.amount_paid)}</td>
                <td className="px-4 py-4 font-semibold">{formatCurrency(layaway.balance_due)}</td>
                <td className="px-4 py-4">
                  <NavLink
                    className="rounded-full border border-[#ddcfba] px-3 py-2 text-xs text-[#7d6751] transition hover:bg-[#f3ecde]"
                    to={`/layaways/${layaway.id}`}
                  >
                    Ver detalle
                  </NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
