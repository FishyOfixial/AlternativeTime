import { formatCurrency, formatLastPurchase } from "../../utils/clients";

export default function ClientDetailStats({ client }) {
  return (
    <section className="grid grid-cols-3 gap-2 md:gap-4">
      <article className="stat-card p-2.5 text-center sm:p-4 lg:min-h-min lg:p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-xs">Compras</p>
        <p className="mt-1 font-serif text-base leading-tight text-[#2a221b] sm:mt-2 sm:text-[28px] lg:text-[34px]">
          {client.purchases_count}
        </p>
      </article>
      <article className="stat-card p-2.5 text-center sm:p-4 lg:min-h-min lg:p-5">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-xs">Gastado</p>
        <p className="mt-1 font-serif text-base leading-tight text-[#5f8f66] sm:mt-2 sm:text-[28px] lg:text-[34px]">
          {formatCurrency(client.total_spent)}
        </p>
      </article>
      <article className="stat-card p-2.5 text-center sm:p-4 lg:min-h-min lg:p-5">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#c2b29a] sm:text-xs">Ultima</p>
        <p className="mt-1 font-serif text-sm leading-tight text-[#2a221b] sm:mt-2 sm:text-[28px] lg:text-[30px]">
          {formatLastPurchase(client.last_purchase_at)}
        </p>
      </article>
    </section>
  );
}
