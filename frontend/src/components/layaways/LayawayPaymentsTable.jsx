import { formatCurrency } from "../../utils/finance";

export default function LayawayPaymentsTable({ payments }) {
  return (
    <section className="panel-surface p-6">
      <p className="font-serif text-2xl text-[#2a221b]">Historial de abonos</p>
      <div className="mt-4 overflow-x-auto">
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
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-[#8a775f]">Todavia no hay abonos registrados.</p>
        ) : null}
      </div>
    </section>
  );
}
