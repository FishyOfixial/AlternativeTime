export default function SalesTable({
  items,
  formatDate,
  formatCurrency,
  channelLabels,
  paymentLabels
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#ddcfba] bg-[#fbf7f0]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[#f0e8dc] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4">ID reloj</th>
              <th className="px-4 py-4">Reloj</th>
              <th className="px-4 py-4">Cliente</th>
              <th className="px-4 py-4">Canal</th>
              <th className="px-4 py-4">Metodo</th>
              <th className="px-4 py-4">Monto</th>
              <th className="px-4 py-4">Costo</th>
              <th className="px-4 py-4">Ganancia</th>
              <th className="px-4 py-4">Margen</th>
            </tr>
          </thead>
          <tbody>
            {items.map((sale) => (
              <tr key={sale.id} className="border-t border-[#eadfcd] text-sm text-[#5d5144]">
                <td className="px-4 py-4">{formatDate(sale.sale_date)}</td>
                <td className="px-4 py-4 font-semibold text-[#b2883e]">
                  {sale.product_code || "-"}
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-[#2a221b]">{sale.product_label || "Venta"}</p>
                </td>
                <td className="px-4 py-4">{sale.customer_name || "Venta libre"}</td>
                <td className="px-4 py-4">
                  {channelLabels[sale.sales_channel] || sale.sales_channel}
                </td>
                <td className="px-4 py-4">
                  {paymentLabels[sale.payment_method] || sale.payment_method}
                </td>
                <td className="px-4 py-4 font-semibold text-[#2a221b]">
                  {formatCurrency(sale.amount_paid)}
                </td>
                <td className="px-4 py-4">{formatCurrency(sale.cost_snapshot)}</td>
                <td className="px-4 py-4 text-[#6ca07e]">
                  {formatCurrency(sale.gross_profit)}
                </td>
                <td className="px-4 py-4">
                  {(Number(sale.profit_percentage || 0) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
