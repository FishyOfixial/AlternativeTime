import EmptyState from "../feedback/EmptyState";

export default function FinanceEntriesTable({
  entries,
  formatDate,
  formatCurrency,
  accountLabels,
  typeLabels,
  conceptLabels
}) {
  return (
    <section className="panel-surface p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3">Reloj</th>
              <th className="px-4 py-3">Notas</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                <td className="px-4 py-4">{formatDate(entry.entry_date)}</td>
                <td className="px-4 py-4">{typeLabels[entry.entry_type] || entry.entry_type}</td>
                <td className="px-4 py-4">{conceptLabels[entry.concept] || entry.concept}</td>
                <td className="px-4 py-4 font-semibold text-[#2a221b]">
                  {formatCurrency(entry.amount)}
                </td>
                <td className="px-4 py-4">{accountLabels[entry.account] || entry.account}</td>
                <td className="px-4 py-4">{entry.product_code || "-"}</td>
                <td className="px-4 py-4">{entry.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="Sin movimientos disponibles"
            message="No hay movimientos con los filtros actuales."
          />
        </div>
      ) : null}
    </section>
  );
}
