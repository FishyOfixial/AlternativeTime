import EmptyState from "../feedback/EmptyState";
import ResponsiveTableShell from "../common/ResponsiveTableShell";

function getTypeStyles(type) {
  return type === "income"
    ? "bg-[#edf7f1] text-[#4e8a5f]"
    : "bg-[#fff1ee] text-[#a55b4f]";
}

function FinanceEntryMobileCard({
  entry,
  formatDate,
  formatCurrency,
  accountLabels,
  typeLabels,
  conceptLabels,
  onEdit
}) {
  return (
    <article className="rounded-2xl border border-[#eadfcd] bg-[#fffdf9] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#b4a085]">{formatDate(entry.entry_date)}</p>
          <p className="mt-0.5 text-[13px] font-medium text-[#2a221b]">
            {conceptLabels[entry.concept] || entry.concept}
          </p>
        </div>
        <p className={`text-[13px] font-semibold ${entry.entry_type === "income" ? "text-[#4e8a5f]" : "text-[#a55b4f]"}`}>
          {formatCurrency(entry.amount)}
        </p>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] ${getTypeStyles(entry.entry_type)}`}>
          {typeLabels[entry.entry_type] || entry.entry_type}
        </span>
        <span className="rounded-full bg-[#f3ede3] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#7b6b57]">
          {accountLabels[entry.account] || entry.account}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-[#5d5144]">
        <p>Reloj: {entry.product_code || "-"}</p>
        <p className="truncate" title={entry.notes || "-"}>
          Nota: {entry.notes || "-"}
        </p>
      </div>

      {onEdit ? (
        <div className="mt-3">
          <button
            className="rounded-lg border border-[#dccfb9] bg-[#fcf8f2] px-3 py-2 text-xs font-semibold text-[#7d6751] transition hover:bg-[#f2e9d9]"
            onClick={() => onEdit(entry)}
            type="button"
          >
            Editar movimiento
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function FinanceEntriesTable({
  entries,
  formatDate,
  formatCurrency,
  accountLabels,
  typeLabels,
  conceptLabels,
  filters,
  onEdit
}) {
  return (
    <section className="space-y-4">
      <div>
        <div>
          <p className="eyebrow">Movimientos</p>
          <h2 className="mt-2 font-serif text-3xl text-[#2a221b]">Historial de movimientos</h2>
        </div>
        {filters ? <div className="mt-4">{filters}</div> : null}
      </div>

      <section className="panel-surface overflow-hidden p-0">
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
                onEdit={onEdit}
              />
            ))}
            desktopContent={
              <table className="w-full min-w-[980px] border-collapse text-left lg:min-w-[1040px]">
                <thead className="sticky top-0 z-10 border-b border-[#eadfcd] bg-[#f6f0e5] text-xs uppercase tracking-[0.16em] text-[#b4a085]">
                  <tr>
                    <th className="w-[120px] px-4 py-3">Fecha</th>
                    <th className="w-[120px] px-4 py-3">Tipo</th>
                    <th className="w-[190px] px-4 py-3">Concepto</th>
                    <th className="w-[140px] px-4 py-3 text-right">Monto</th>
                    <th className="w-[120px] px-4 py-3">Cuenta</th>
                    <th className="hidden w-[90px] px-4 py-3 lg:table-cell">Reloj</th>
                    <th className="min-w-[220px] px-4 py-3">Notas</th>
                    <th className="w-[130px] px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-[#eee2cd] text-sm text-[#5d5144]">
                      <td className="px-4 py-4">{formatDate(entry.entry_date)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${getTypeStyles(entry.entry_type)}`}>
                          {typeLabels[entry.entry_type] || entry.entry_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-[#2a221b]">{conceptLabels[entry.concept] || entry.concept}</td>
                      <td className={`px-4 py-4 text-right font-semibold ${entry.entry_type === "income" ? "text-[#4e8a5f]" : "text-[#a55b4f]"}`}>
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[#f3ede3] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7b6b57]">
                          {accountLabels[entry.account] || entry.account}
                        </span>
                      </td>
                      <td className="hidden px-4 py-4 lg:table-cell">{entry.product_code || "-"}</td>
                      <td className="px-4 py-4">
                        <p className="truncate" title={entry.notes || "-"}>
                          {entry.notes || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {onEdit ? (
                          <button
                            className="rounded-lg border border-[#dccfb9] bg-[#fcf8f2] px-3 py-2 text-xs font-semibold text-[#7d6751] transition hover:bg-[#f2e9d9]"
                            onClick={() => onEdit(entry)}
                            type="button"
                          >
                            Editar
                          </button>
                        ) : (
                          <span className="text-xs text-[#b4a085]">-</span>
                        )}
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
    </section>
  );
}
