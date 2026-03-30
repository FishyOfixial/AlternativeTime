import { formatCurrency } from "../../utils/finance";

export default function LayawayPaymentsTable({ payments }) {
  return (
    <section className="panel-surface p-5 sm:p-6">
      <p className="eyebrow">Abonos</p>
      <p className="mt-2 font-serif text-2xl text-[#2a221b]">Historial de abonos</p>

      {payments.length === 0 ? (
        <p className="mt-4 text-sm text-[#8a775f]">Todavia no hay abonos registrados.</p>
      ) : null}

      <div className="mt-4 space-y-3 sm:hidden">
        {payments.map((payment) => (
          <article key={payment.id} className="rounded-2xl border border-[#eadfcd] bg-[#fffdf9] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[#b09a7e]">Fecha</p>
                <p className="mt-1 font-semibold text-[#2a221b]">{payment.payment_date}</p>
              </div>
              <p className="font-serif text-xl text-[#2a221b]">{formatCurrency(payment.amount)}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#6e6152]">
              <div>
                <p className="uppercase tracking-[0.08em] text-[#b09a7e]">Metodo</p>
                <p className="mt-1">{payment.payment_method}</p>
              </div>
              <div>
                <p className="uppercase tracking-[0.08em] text-[#b09a7e]">Cuenta</p>
                <p className="mt-1">{payment.account}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="min-w-full border-collapse text-left">
          <thead className="border-b border-[#eadfcd] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="pb-3 pr-4">Fecha</th>
              <th className="pb-3 pr-4">Metodo</th>
              <th className="pb-3 pr-4">Cuenta</th>
              <th className="pb-3">Monto</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                <td className="py-4 pr-4">{payment.payment_date}</td>
                <td className="py-4 pr-4">{payment.payment_method}</td>
                <td className="py-4 pr-4">{payment.account}</td>
                <td className="py-4 font-semibold">{formatCurrency(payment.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
