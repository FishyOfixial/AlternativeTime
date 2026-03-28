import EmptyState from "../feedback/EmptyState";
import ResponsiveTableShell from "../common/ResponsiveTableShell";

function FinanceEntryMobileCard({
  entry,
  formatDate,
  formatCurrency,
  accountLabels,
  typeLabels,
  conceptLabels
}) {
  return (
    <article className="rounded-xl border border-[#eadfcd] bg-[#fffdf9] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#b4a085]">{formatDate(entry.entry_date)}</p>
          <p className="font-medium text-[#2a221b]">{conceptLabels[entry.concept] || entry.concept}</p>
        </div>
        <p className="text-sm font-semibold text-[#2a221b]">{formatCurrency(entry.amount)}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5d5144]">
        <p>{typeLabels[entry.entry_type] || entry.entry_type}</p>
        <p>{accountLabels[entry.account] || entry.account}</p>
        <p>Reloj: {entry.product_code || "-"}</p>
        <p className="truncate" title={entry.notes || "-"}>
          Nota: {entry.notes || "-"}
        </p>
      </div>
    </article>
  );
}

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
      {entries.length > 0 ? (
        <ResponsiveTableShell
          bordered={false}
          mobileContent={entries.map((entry) => (
            <FinanceEntryMobileCard
              key={entry.id}
              entry={entry}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              accountLabels={accountLabels}
              typeLabels={typeLabels}
              conceptLabels={conceptLabels}
            />
          ))}
          desktopContent={
            <table className="w-full min-w-[920px] border-collapse text-left lg:min-w-[980px]">
              <thead className="sticky top-0 z-10 border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
                <tr>
                  <th className="w-[120px] px-4 py-3">Fecha</th>
                  <th className="w-[120px] px-4 py-3">Tipo</th>
                  <th className="w-[180px] px-4 py-3">Concepto</th>
                  <th className="w-[120px] px-4 py-3">Monto</th>
                  <th className="w-[120px] px-4 py-3">Cuenta</th>
                  <th className="hidden w-[90px] px-4 py-3 lg:table-cell">Reloj</th>
                  <th className="min-w-[220px] px-4 py-3">Notas</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                    <td className="px-4 py-4">{formatDate(entry.entry_date)}</td>
                    <td className="px-4 py-4">{typeLabels[entry.entry_type] || entry.entry_type}</td>
                    <td className="px-4 py-4">{conceptLabels[entry.concept] || entry.concept}</td>
                    <td className="px-4 py-4 font-semibold text-[#2a221b]">{formatCurrency(entry.amount)}</td>
                    <td className="px-4 py-4">{accountLabels[entry.account] || entry.account}</td>
                    <td className="hidden px-4 py-4 lg:table-cell">{entry.product_code || "-"}</td>
                    <td className="px-4 py-4">
                      <p className="truncate" title={entry.notes || "-"}>
                        {entry.notes || "-"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        />
      ) : null}

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
