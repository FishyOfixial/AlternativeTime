import ResponsiveTableShell from "../common/ResponsiveTableShell";

function SaleMobileCard({ sale, formatDate, formatCurrency, channelLabels, paymentLabels }) {
  return (
    <article className="rounded-xl border border-[#eadfcd] bg-[#fffdf9] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-[#b4a085]">{sale.product_code || "-"}</p>
          <p className="truncate font-medium text-[#2a221b]" title={sale.product_label || "Venta"}>
            {sale.product_label || "Venta"}
          </p>
          <p className="mt-1 text-xs text-[#8a775f]">{formatDate(sale.sale_date)}</p>
        </div>
        <p className="text-sm font-semibold text-[#2a221b]">{formatCurrency(sale.amount_paid)}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5d5144]">
        <p className="truncate" title={sale.customer_name || "Venta libre"}>
          Cliente: {sale.customer_name || "Venta libre"}
        </p>
        <p>{channelLabels[sale.sales_channel] || sale.sales_channel}</p>
        <p>{paymentLabels[sale.payment_method] || sale.payment_method}</p>
        <p className="font-semibold text-[#6ca07e]">{formatCurrency(sale.gross_profit)}</p>
      </div>
    </article>
  );
}

export default function SalesTable({
  items,
  formatDate,
  formatCurrency,
  channelLabels,
  paymentLabels
}) {
  return (
    <ResponsiveTableShell
      mobileContent={items.map((sale) => (
        <SaleMobileCard
          key={sale.id}
          sale={sale}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          channelLabels={channelLabels}
          paymentLabels={paymentLabels}
        />
      ))}
      desktopContent={
        <table className="w-full min-w-[980px] border-collapse text-left lg:min-w-[1080px]">
          <thead className="sticky top-0 z-10 bg-[#f0e8dc] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="w-[120px] px-4 py-4">Fecha</th>
              <th className="w-[110px] px-4 py-4">ID reloj</th>
              <th className="min-w-[220px] px-4 py-4">Reloj</th>
              <th className="w-[170px] px-4 py-4">Cliente</th>
              <th className="hidden w-[120px] px-4 py-4 lg:table-cell">Canal</th>
              <th className="hidden w-[120px] px-4 py-4 lg:table-cell">Metodo</th>
              <th className="w-[120px] px-4 py-4">Monto</th>
              <th className="hidden w-[120px] px-4 py-4 lg:table-cell">Costo</th>
              <th className="w-[120px] px-4 py-4">Ganancia</th>
              <th className="w-[90px] px-4 py-4">Margen</th>
            </tr>
          </thead>
          <tbody>
            {items.map((sale) => (
              <tr key={sale.id} className="border-t border-[#eadfcd] text-sm text-[#5d5144]">
                <td className="px-4 py-4">{formatDate(sale.sale_date)}</td>
                <td className="px-4 py-4 font-semibold text-[#b2883e]">{sale.product_code || "-"}</td>
                <td className="px-4 py-4">
                  <p className="truncate font-medium text-[#2a221b]" title={sale.product_label || "Venta"}>
                    {sale.product_label || "Venta"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="truncate" title={sale.customer_name || "Venta libre"}>
                    {sale.customer_name || "Venta libre"}
                  </p>
                </td>
                <td className="hidden px-4 py-4 lg:table-cell">{channelLabels[sale.sales_channel] || sale.sales_channel}</td>
                <td className="hidden px-4 py-4 lg:table-cell">{paymentLabels[sale.payment_method] || sale.payment_method}</td>
                <td className="px-4 py-4 font-semibold text-[#2a221b]">{formatCurrency(sale.amount_paid)}</td>
                <td className="hidden px-4 py-4 lg:table-cell">{formatCurrency(sale.cost_snapshot)}</td>
                <td className="px-4 py-4 text-[#6ca07e]">{formatCurrency(sale.gross_profit)}</td>
                <td className="px-4 py-4">{(Number(sale.profit_percentage || 0) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}
