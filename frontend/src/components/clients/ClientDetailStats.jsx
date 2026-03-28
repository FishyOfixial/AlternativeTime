import { formatCurrency, formatLastPurchase } from "../../utils/clients";

export default function ClientDetailStats({ client, averageTicket }) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Compras</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{client.purchases_count}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Total gastado</p>
        <p className="mt-2 font-serif text-[36px] text-[#5f8f66]">
          {formatCurrency(client.total_spent)}
        </p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Ticket prom.</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">{formatCurrency(averageTicket)}</p>
      </article>
      <article className="stat-card">
        <p className="text-sm uppercase tracking-[0.16em] text-[#c2b29a]">Ultima compra</p>
        <p className="mt-2 font-serif text-[36px] text-[#2a221b]">
          {formatLastPurchase(client.last_purchase_at)}
        </p>
      </article>
    </section>
  );
}
