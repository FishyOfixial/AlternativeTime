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

export default function LayawaysTable({ layaways }) {
  return (
    <div className="overflow-x-auto">
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
                  {layaway.is_overdue ? "Vencido" : layawayStatusLabels[layaway.status] || layaway.status}
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
  );
}
