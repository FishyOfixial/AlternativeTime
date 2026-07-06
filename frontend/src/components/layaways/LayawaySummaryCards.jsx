import { layawayStatusLabels } from "../../constants/layaways";
import { formatBusinessDate, getBusinessTodayIsoDate } from "../../utils/dates";
import { formatCurrency } from "../../utils/finance";

function getDueDateContext(layaway) {
  if (!layaway.due_date) {
    return { label: "Sin fecha acordada", className: "text-[#8a775f]" };
  }
  if (layaway.status === "completed") {
    return { label: "Apartado liquidado", className: "text-[#5f8f66]" };
  }
  if (layaway.status === "cancelled") {
    return { label: "Apartado cancelado", className: "text-[#8a775f]" };
  }

  const today = new Date(`${getBusinessTodayIsoDate()}T12:00:00Z`);
  const dueDate = new Date(`${layaway.due_date}T12:00:00Z`);
  const days = Math.round((dueDate - today) / 86400000);

  if (days < 0) {
    const elapsed = Math.abs(days);
    return {
      label: `Venció hace ${elapsed} ${elapsed === 1 ? "día" : "días"}`,
      className: "text-[#a55b4f]"
    };
  }
  if (days === 0) {
    return { label: "Vence hoy", className: "text-[#a55b4f]" };
  }
  return {
    label: `Faltan ${days} ${days === 1 ? "día" : "días"}`,
    className: days <= 7 ? "text-[#a87831]" : "text-[#5f8f66]"
  };
}

export default function LayawaySummaryCards({ layaway }) {
  const dueDateContext = getDueDateContext(layaway);

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Estado</p>
        <p className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-[28px]">
          {layawayStatusLabels[layaway.status] || layaway.status}
        </p>
      </article>
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Precio acordado</p>
        <p className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-[28px]">{formatCurrency(layaway.agreed_price)}</p>
      </article>
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Abonado</p>
        <p className="mt-2 font-serif text-2xl text-[#2a221b] sm:text-[28px]">{formatCurrency(layaway.amount_paid)}</p>
      </article>
      <article className="stat-card">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Saldo pendiente</p>
        <p className="mt-2 font-serif text-2xl text-[#a55b4f] sm:text-[28px]">{formatCurrency(layaway.balance_due)}</p>
      </article>
      <article className="stat-card col-span-2 lg:col-span-1">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#c2b29a]">Término de pago</p>
        <p className="mt-2 font-serif text-xl text-[#2a221b] sm:text-2xl">
          {layaway.due_date ? formatBusinessDate(layaway.due_date) : "Sin fecha"}
        </p>
        <p className={`mt-1 text-xs font-semibold ${dueDateContext.className}`}>
          {dueDateContext.label}
        </p>
      </article>
    </section>
  );
}
